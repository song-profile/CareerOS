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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Google Calendar 연동의 오케스트레이션. connect/callback/status/sync/disconnect/test-event
 * 컨트롤러가 이 클래스 하나만 바라본다. Google과의 실제 통신은 {@link GoogleOAuthService}와
 * {@link GoogleCalendarApiClient}에 위임하고, 여기서는 CareerDock 쪽 상태(연결/이벤트) 전이만
 * 책임진다.
 */
@Service
public class GoogleCalendarSyncService {

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
            HttpServletResponse response
    ) throws IOException {
        Object expectedState = session.getAttribute(OAUTH_STATE_SESSION_KEY);
        session.removeAttribute(OAUTH_STATE_SESSION_KEY);
        if (expectedState == null || !expectedState.equals(state) || code == null || code.isBlank()) {
            redirectWithResult(response, false, "INVALID_REQUEST");
            return;
        }
        try {
            GoogleTokenResponse tokenResponse = googleOAuthService.exchangeCode(code);
            String refreshToken = tokenResponse.getRefreshToken();
            if (refreshToken == null) {
                // access_type=offline + prompt=consent를 항상 쓰므로 정상 흐름에서는 거의 없지만,
                // Google이 refresh_token을 안 주면 재동기화를 할 수 없으니 방어적으로 막는다.
                redirectWithResult(response, false, "NO_REFRESH_TOKEN");
                return;
            }

            CalendarConnection connection = upsertConnection(userId, tokenResponse, refreshToken);
            Credential credential = credentialFor(connection);
            String calendarId = apiClient.findOrCreateCalendar(credential, connection.getGoogleCalendarId());
            connection.markConnected(calendarId);

            redirectWithResult(response, true, null);
        } catch (RuntimeException exception) {
            redirectWithResult(response, false, "CONNECT_FAILED");
        }
    }

    private CalendarConnection upsertConnection(Long userId, GoogleTokenResponse tokenResponse, String refreshToken) {
        String encryptedRefresh = tokenCipher.encrypt(refreshToken);
        String encryptedAccess = tokenCipher.encrypt(tokenResponse.getAccessToken());
        Instant expiresAt = expiresAt(tokenResponse);

        return connectionRepository.findByUserId(userId)
                .map(existing -> {
                    existing.reconnect(null, encryptedRefresh, encryptedAccess, expiresAt);
                    return existing;
                })
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
                    return connectionRepository.save(
                            CalendarConnection.connect(user, null, encryptedRefresh, encryptedAccess, expiresAt));
                });
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
     * CalendarService의 create/update 직후에 호출되는 best-effort push. 연결이 없으면 조용히
     * 건너뛴다. Google 실패는 이벤트/연결에 상태만 남기고 절대 예외를 다시 던지지 않는다 —
     * CareerDock 쪽 쓰기는 Google 상태와 무관하게 이미 성공했어야 한다.
     *
     * ponytail: 호출자의 같은 트랜잭션 안에서 동기 호출된다(네트워크 호출 중 DB 커넥션 점유).
     * MVP 트래픽에서는 괜찮다 — 지연이 실측되면 커밋 이후로 옮긴다(TransactionalEventListener).
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
            event.markSyncFailed(exception.errorCode().code());
            connection.markSyncFailed(exception.errorCode().code());
        }
    }

    /**
     * CalendarService.delete 직전에, 행이 사라지기 전에 호출된다. 삭제할 이벤트가 Google에
     * 이미 없으면(404) 목표는 이미 달성된 것이므로 조용히 넘어간다. 삭제가 실제로 실패하면
     * CareerDock 쪽 행은 이 호출 직후 사라지므로 실패를 남길 곳이 없다 — CareerDock 전용
     * 보조 캘린더 안에서만 생기는 고아 이벤트라 낮은 위험으로 보고 연결 상태에만 표시한다.
     */
    @Transactional
    public void pushDelete(RecruitmentEvent event) {
        if (event.getGoogleEventId() == null) {
            return;
        }
        CalendarConnection connection = connectionRepository.findByUserId(event.getUser().getId()).orElse(null);
        if (connection == null || connection.getGoogleCalendarId() == null) {
            return;
        }
        try {
            Credential credential = credentialFor(connection);
            apiClient.deleteEvent(credential, connection.getGoogleCalendarId(), event.getGoogleEventId());
            connection.markSynced();
        } catch (GoogleResourceNotFoundException notFound) {
            // 이미 Google 쪽에 없다 — 목표 달성.
        } catch (CareerdockException exception) {
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
