package com.careerdock.calendar.service;

import com.careerdock.calendar.domain.CalendarConnection;
import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.calendar.domain.SyncStatus;
import com.careerdock.calendar.dto.CalendarConnectResponse;
import com.careerdock.calendar.dto.CalendarStatusResponse;
import com.careerdock.calendar.dto.CalendarSyncResponse;
import com.careerdock.calendar.dto.TestEventResponse;
import com.careerdock.calendar.repository.CalendarConnectionRepository;
import com.careerdock.calendar.repository.RecruitmentEventRepository;
import com.careerdock.global.config.AppProperties;
import com.careerdock.global.exception.CareerdockException;
import com.careerdock.global.exception.ErrorCode;
import com.careerdock.global.exception.NotFoundException;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.CredentialRefreshListener;
import com.google.api.client.auth.oauth2.TokenErrorResponse;
import com.google.api.client.auth.oauth2.TokenResponseException;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.services.calendar.model.Event;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Google Calendar 연동의 오케스트레이션. connect/callback/status/sync/disconnect/test-event
 * 컨트롤러가 이 클래스 하나만 바라본다. Google과의 실제 통신은 {@link GoogleOAuthService}와
 * {@link GoogleCalendarApiClient}에 위임하고, 여기서는 CareerDock 쪽 상태(연결/이벤트) 전이만
 * 책임진다.
 */
@Service
public class GoogleCalendarSyncService {

    private static final Logger log = LoggerFactory.getLogger(GoogleCalendarSyncService.class);
    private static final String OAUTH_STATE_SESSION_KEY = "google_calendar_oauth_state";
    private static final String CALENDAR_SETTINGS_PATH = "/settings/calendar";
    private static final int MAX_RETRY_BATCH = 50;

    private final CalendarConnectionRepository connectionRepository;
    private final RecruitmentEventRepository eventRepository;
    private final UserRepository userRepository;
    private final GoogleOAuthService googleOAuthService;
    private final GoogleCalendarApiClient apiClient;
    private final GoogleTokenCipher tokenCipher;
    private final AppProperties appProperties;

    public GoogleCalendarSyncService(
            CalendarConnectionRepository connectionRepository,
            RecruitmentEventRepository eventRepository,
            UserRepository userRepository,
            GoogleOAuthService googleOAuthService,
            GoogleCalendarApiClient apiClient,
            GoogleTokenCipher tokenCipher,
            AppProperties appProperties
    ) {
        this.connectionRepository = connectionRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.googleOAuthService = googleOAuthService;
        this.apiClient = apiClient;
        this.tokenCipher = tokenCipher;
        this.appProperties = appProperties;
    }

    public CalendarConnectResponse startConnect(HttpSession session) {
        String state = UUID.randomUUID().toString();
        session.setAttribute(OAUTH_STATE_SESSION_KEY, state);
        return new CalendarConnectResponse(googleOAuthService.buildAuthorizationUrl(state));
    }

    /**
     * 이미 로그인된 세션에서만 도착한다(컨트롤러가 인증을 요구). state가 세션에 저장해둔 값과
     * 다르면 CSRF로 간주하고 즉시 실패 처리한다. 실패해도 예외를 던지지 않고 항상 프론트로
     * 리다이렉트한다 — 브라우저 최상위 이동이라 JSON 에러 응답을 보여줄 화면이 없다.
     */
    @Transactional
    public void handleCallback(
            Long userId,
            HttpSession session,
            String code,
            String state,
            String error,
            HttpServletResponse response
    ) throws IOException {
        Object expectedState = session.getAttribute(OAUTH_STATE_SESSION_KEY);
        session.removeAttribute(OAUTH_STATE_SESSION_KEY);
        if (error != null && !error.isBlank()) {
            redirectWithResult(response, false, "GOOGLE_AUTH_DENIED");
            return;
        }
        if (expectedState == null || !expectedState.equals(state) || code == null || code.isBlank()) {
            // state/code 값 자체는 남기지 않는다. 무엇이 비었는지만 알면 원인 구분은 충분하다.
            log.warn("google calendar 연결 실패: userId={}, endpoint=/api/calendar/oauth/callback, reason=INVALID_REQUEST, "
                            + "stateMissing={}, stateMismatch={}, codeMissing={}",
                    userId,
                    expectedState == null,
                    expectedState != null && !expectedState.equals(state),
                    code == null || code.isBlank());
            redirectWithResult(response, false, "INVALID_REQUEST");
            return;
        }
        try {
            GoogleTokenResponse tokenResponse = googleOAuthService.exchangeCode(code);
            String refreshToken = tokenResponse.getRefreshToken();
            if (refreshToken == null) {
                // access_type=offline + prompt=consent를 항상 쓰므로 정상 흐름에서는 거의 없지만,
                // Google이 refresh_token을 안 주면 재동기화를 할 수 없으니 방어적으로 막는다.
                log.warn("google calendar 연결 실패: userId={}, endpoint=/api/calendar/oauth/callback, "
                        + "reason=NO_REFRESH_TOKEN", userId);
                redirectWithResult(response, false, "NO_REFRESH_TOKEN");
                return;
            }

            String existingCalendarId = connectionRepository.findByUserId(userId)
                    .map(CalendarConnection::getGoogleCalendarId)
                    .orElse(null);
            Credential credential = googleOAuthService.buildCredential(
                    tokenResponse.getAccessToken(),
                    refreshToken,
                    expiresAt(tokenResponse),
                    null
            );
            String calendarId = apiClient.findOrCreateCalendar(credential, existingCalendarId);
            CalendarConnection connection = upsertConnection(userId, tokenResponse, refreshToken, calendarId);

            log.info("google calendar 연결 완료: userId={}, connectionId={}", userId, connection.getId());
            redirectWithResult(response, true, null);
        } catch (CareerdockException exception) {
            String reason = exception.errorCode().code();
            log.warn("Google Calendar OAuth callback failed. userId={}, reason={}, exception={}",
                    userId, reason, exception.getClass().getSimpleName());
            redirectWithResult(response, false, reason);
        } catch (IOException exception) {
            String reason = oauthFailureReason(exception);
            log.warn("Google Calendar OAuth token exchange failed. userId={}, reason={}, exception={}",
                    userId, reason, exception.getClass().getSimpleName());
            redirectWithResult(response, false, reason);
        } catch (RuntimeException exception) {
            // 예외 메시지에는 code/token이 들어갈 수 있어 클래스 이름만 남긴다.
            log.warn("google calendar 연결 실패: userId={}, endpoint=/api/calendar/oauth/callback, "
                    + "reason=CONNECT_FAILED, cause={}", userId, exception.getClass().getSimpleName());
            redirectWithResult(response, false, "CONNECT_FAILED");
        }
    }

    private CalendarConnection upsertConnection(
            Long userId,
            GoogleTokenResponse tokenResponse,
            String refreshToken,
            String calendarId
    ) {
        String encryptedRefresh = tokenCipher.encrypt(refreshToken);
        String encryptedAccess = tokenCipher.encrypt(tokenResponse.getAccessToken());
        Instant expiresAt = expiresAt(tokenResponse);

        return connectionRepository.findByUserId(userId)
                .map(existing -> {
                    existing.reconnect(null, encryptedRefresh, encryptedAccess, expiresAt);
                    existing.markConnected(calendarId);
                    return existing;
                })
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
                    CalendarConnection connection = CalendarConnection.connect(
                            user, null, encryptedRefresh, encryptedAccess, expiresAt);
                    connection.markConnected(calendarId);
                    return connectionRepository.save(connection);
                });
    }

    private String oauthFailureReason(IOException exception) {
        if (exception instanceof TokenResponseException tokenResponseException) {
            String googleError = tokenResponseException.getDetails() == null
                    ? null
                    : tokenResponseException.getDetails().getError();
            if ("access_denied".equals(googleError)) {
                return "GOOGLE_AUTH_DENIED";
            }
            if ("invalid_grant".equals(googleError) || "invalid_request".equals(googleError)) {
                return "INVALID_REQUEST";
            }
        }
        return "GOOGLE_TOKEN_EXCHANGE_FAILED";
    }

    @Transactional(readOnly = true)
    public CalendarStatusResponse status(Long userId) {
        Map<SyncStatus, Long> counts = eventRepository.findSyncStatusesByUserId(userId).stream()
                .collect(Collectors.groupingBy(status -> status, Collectors.counting()));
        return connectionRepository.findByUserId(userId)
                .map(connection -> new CalendarStatusResponse(
                        true,
                        connection.getStatus(),
                        connection.getConnectedAt(),
                        connection.getLastSyncedAt(),
                        connection.getLastSyncError(),
                        counts
                ))
                .orElseGet(() -> CalendarStatusResponse.notConnected(counts));
    }

    /** 실패했거나 아직 한 번도 push되지 않은 이벤트를 한 번에 최대 {@value #MAX_RETRY_BATCH}건 재시도한다. */
    @Transactional
    public CalendarSyncResponse retrySync(Long userId) {
        connectionRepository.findByUserId(userId)
                .orElseThrow(() -> new CareerdockException(ErrorCode.GOOGLE_NOT_CONNECTED, ErrorCode.GOOGLE_NOT_CONNECTED.message()));

        List<RecruitmentEvent> targets = eventRepository.findByUserIdAndSyncStatusIn(
                userId, List.of(SyncStatus.NOT_CONNECTED, SyncStatus.FAILED), PageRequest.of(0, MAX_RETRY_BATCH));

        int synced = 0;
        for (RecruitmentEvent event : targets) {
            pushUpsert(event);
            if (event.getSyncStatus() == SyncStatus.SYNCED) {
                synced++;
            }
        }
        return new CalendarSyncResponse(targets.size(), synced, targets.size() - synced);
    }

    @Transactional
    public void disconnect(Long userId) {
        CalendarConnection connection = connectionRepository.findByUserId(userId).orElse(null);
        if (connection == null) {
            return;
        }
        googleOAuthService.revoke(tokenCipher.decrypt(connection.getRefreshTokenEncrypted()));
        connectionRepository.delete(connection);

        List<RecruitmentEvent> events = eventRepository.findByUserIdAndSyncStatusIn(
                userId, List.of(SyncStatus.SYNCED, SyncStatus.FAILED), Pageable.unpaged());
        events.forEach(RecruitmentEvent::resetForDisconnect);
    }

    @Transactional
    public TestEventResponse testEvent(Long userId) {
        CalendarConnection connection = connectionRepository.findByUserId(userId)
                .filter(c -> c.getGoogleCalendarId() != null)
                .orElseThrow(() -> new CareerdockException(ErrorCode.GOOGLE_NOT_CONNECTED, ErrorCode.GOOGLE_NOT_CONNECTED.message()));

        Credential credential = credentialFor(connection);
        Event event = apiClient.insertTestEvent(credential, connection.getGoogleCalendarId());
        connection.markSynced();
        return new TestEventResponse(event.getId(), event.getHtmlLink());
    }

    /**
     * CalendarService의 create/update 커밋 이후에 비동기로 소비되는 이벤트. 커밋 전 트랜잭션
     * 안에서는 Google 네트워크 호출을 하지 않으므로 저장 요청의 응답 지연에 영향을 주지 않는다.
     *
     * ponytail: 큐 없이 Spring 이벤트 + @Async 스레드로만 분리한다. 재시도는 이미 존재하는
     * retrySync/상태 폴링에 맡긴다 — 실패해도 event가 FAILED로 남아 다음 retrySync가 집어간다.
     *
     * REQUIRES_NEW인 이유: 원본 트랜잭션은 AFTER_COMMIT 시점에 이미 끝났고, 이 메서드는 별도
     * 스레드(@Async)에서 실행되어 이어받을 트랜잭션이 애초에 없다. Spring도 TransactionalEventListener
     * 메서드에는 REQUIRES_NEW/NOT_SUPPORTED 외의 전파 옵션을 허용하지 않는다.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUpsertRequested(RecruitmentEventUpsertRequested requested) {
        eventRepository.findById(requested.eventId()).ifPresent(this::pushUpsert);
    }

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDeleteRequested(RecruitmentEventDeleteRequested requested) {
        pushDelete(requested.eventId(), requested.userId(), requested.googleEventId());
    }

    /**
     * 위 리스너 또는 retrySync에서 호출되는 best-effort push. 연결이 없으면 조용히 건너뛴다.
     * Google 실패는 이벤트/연결에 상태만 남기고 절대 예외를 다시 던지지 않는다 — CareerDock
     * 쪽 쓰기는 Google 상태와 무관하게 이미 성공했어야 한다.
     */
    @Transactional
    public void pushUpsert(RecruitmentEvent event) {
        CalendarConnection connection = connectionRepository.findByUserId(event.getUser().getId()).orElse(null);
        if (connection == null) {
            return;
        }
        try {
            Credential credential = credentialFor(connection);
            if (connection.getGoogleCalendarId() == null) {
                connection.markConnected(apiClient.findOrCreateCalendar(credential, null));
            }
            pushUpsertOnce(connection, credential, event);
        } catch (GoogleResourceNotFoundException notFound) {
            recoverCalendarThenRetry(connection, event);
        } catch (CareerdockException exception) {
            log.warn("google calendar 동기화 실패: userId={}, eventId={}, operation=push-upsert, reason={}",
                    event.getUser().getId(), event.getId(), exception.errorCode().code());
            event.markSyncFailed(exception.errorCode().code());
            connection.markSyncFailed(exception.errorCode().code());
        }
    }

    /** 로컬 행이 아직 있을 때(삭제 직전) 필요한 값만 뽑아 {@link #pushDelete(Long, Long, String)}에 위임한다. */
    public void pushDelete(RecruitmentEvent event) {
        pushDelete(event.getId(), event.getUser().getId(), event.getGoogleEventId());
    }

    /**
     * 삭제할 이벤트가 Google에 이미 없으면(404) 목표는 이미 달성된 것이므로 조용히 넘어간다.
     * 이 시점엔 CareerDock 쪽 행이 이미 사라졌을 수 있어(커밋 이후 비동기 경로) 실패를 남길 곳이
     * 없다 — CareerDock 전용 보조 캘린더 안에서만 생기는 고아 이벤트라 낮은 위험으로 보고 연결
     * 상태에만 표시한다.
     */
    @Transactional
    public void pushDelete(Long eventId, Long userId, String googleEventId) {
        if (googleEventId == null) {
            return;
        }
        CalendarConnection connection = connectionRepository.findByUserId(userId).orElse(null);
        if (connection == null || connection.getGoogleCalendarId() == null) {
            return;
        }
        try {
            Credential credential = credentialFor(connection);
            apiClient.deleteEvent(credential, connection.getGoogleCalendarId(), googleEventId);
            connection.markSynced();
        } catch (GoogleResourceNotFoundException notFound) {
            // 이미 Google 쪽에 없다 — 목표 달성.
        } catch (CareerdockException exception) {
            log.warn("google calendar 동기화 실패: userId={}, eventId={}, operation=push-delete, reason={}",
                    userId, eventId, exception.errorCode().code());
            connection.markSyncFailed(exception.errorCode().code());
        }
    }

    private void pushUpsertOnce(CalendarConnection connection, Credential credential, RecruitmentEvent event) {
        Event googleEvent = event.getGoogleEventId() == null
                ? apiClient.insertEvent(credential, connection.getGoogleCalendarId(), event)
                : apiClient.updateEvent(credential, connection.getGoogleCalendarId(), event.getGoogleEventId(), event);
        event.markSynced(googleEvent.getId());
        connection.markSynced();
    }

    /**
     * push가 404를 받았을 때, 사라진 게 캘린더 자체인지 이 이벤트뿐인지 구분한다. 캘린더가
     * 사라졌었다면 새로 만들고 한 번만 재시도하고, 캘린더는 멀쩡하면 이 이벤트 연결만 끊는다.
     */
    private void recoverCalendarThenRetry(CalendarConnection connection, RecruitmentEvent event) {
        try {
            Credential credential = credentialFor(connection);
            String previousCalendarId = connection.getGoogleCalendarId();
            String calendarId = apiClient.findOrCreateCalendar(credential, previousCalendarId);
            if (calendarId.equals(previousCalendarId)) {
                event.clearGoogleLink("GOOGLE_EVENT_NOT_FOUND");
                return;
            }
            connection.markConnected(calendarId);
            event.clearGoogleLink(null);
            pushUpsertOnce(connection, credential, event);
        } catch (CareerdockException | GoogleResourceNotFoundException exception) {
            log.warn("google calendar 복구 실패: userId={}, eventId={}, operation=recover-calendar, "
                            + "reason=GOOGLE_CALENDAR_RECOVERY_FAILED, cause={}",
                    event.getUser().getId(), event.getId(), exception.getClass().getSimpleName());
            event.markSyncFailed("GOOGLE_CALENDAR_RECOVERY_FAILED");
            connection.markSyncFailed("GOOGLE_CALENDAR_RECOVERY_FAILED");
        }
    }

    private Credential credentialFor(CalendarConnection connection) {
        return googleOAuthService.buildCredential(
                tokenCipher.decrypt(connection.getAccessTokenEncrypted()),
                tokenCipher.decrypt(connection.getRefreshTokenEncrypted()),
                connection.getAccessTokenExpiresAt(),
                refreshListenerFor(connection.getId())
        );
    }

    /**
     * Google SDK가 만료된 access token을 자동으로 갱신했을 때 결과를 반영한다. 이미 열려 있는
     * 트랜잭션 안에서 동기적으로 불리므로, 조회한 엔티티는 영속성 컨텍스트가 그대로 관리해
     * 커밋 시점에 반영된다 — 별도로 save를 호출할 필요가 없다.
     */
    private CredentialRefreshListener refreshListenerFor(Long connectionId) {
        return new CredentialRefreshListener() {
            @Override
            public void onTokenResponse(Credential credential, TokenResponse tokenResponse) {
                connectionRepository.findById(connectionId).ifPresent(connection -> {
                    Instant expiresAt = tokenResponse.getExpiresInSeconds() == null
                            ? null
                            : Instant.now().plusSeconds(tokenResponse.getExpiresInSeconds());
                    connection.applyRefreshedAccessToken(tokenCipher.encrypt(tokenResponse.getAccessToken()), expiresAt);
                });
            }

            @Override
            public void onTokenErrorResponse(Credential credential, TokenErrorResponse tokenErrorResponse) {
                // refresh token 자체가 무효화됨(예: 사용자가 Google 계정 설정에서 직접 해제).
                // 재연결 전에는 더 이상 이 연결로 아무 것도 할 수 없다.
                // tokenErrorResponse.getError()는 "invalid_grant" 같은 사유 코드일 뿐 토큰이 아니다.
                log.warn("google calendar refresh token 무효화: connectionId={}, reason=GOOGLE_TOKEN_EXPIRED, "
                        + "googleError={}", connectionId, tokenErrorResponse.getError());
                connectionRepository.findById(connectionId)
                        .ifPresent(connection -> connection.markSyncFailed("GOOGLE_TOKEN_EXPIRED"));
            }
        };
    }

    private Instant expiresAt(GoogleTokenResponse tokenResponse) {
        Long expiresInSeconds = tokenResponse.getExpiresInSeconds();
        return expiresInSeconds == null ? null : Instant.now().plusSeconds(expiresInSeconds);
    }

    private void redirectWithResult(HttpServletResponse response, boolean connected, String reason) throws IOException {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUri(appProperties.frontendUrl())
                .path(CALENDAR_SETTINGS_PATH)
                .queryParam("connected", connected);
        if (reason != null) {
            builder.queryParam("reason", reason);
        }
        response.sendRedirect(builder.build().toUriString());
    }
}
