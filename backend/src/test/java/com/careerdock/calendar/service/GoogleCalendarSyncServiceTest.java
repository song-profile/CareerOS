package com.careerdock.calendar.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.careerdock.calendar.domain.CalendarConnection;
import com.careerdock.calendar.domain.EventType;
import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.calendar.domain.SyncStatus;
import com.careerdock.calendar.dto.CalendarStatusResponse;
import com.careerdock.calendar.dto.CalendarSyncResponse;
import com.careerdock.calendar.repository.CalendarConnectionRepository;
import com.careerdock.calendar.repository.RecruitmentEventRepository;
import com.careerdock.global.config.AppProperties;
import com.careerdock.global.exception.CareerdockException;
import com.careerdock.global.exception.ErrorCode;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.services.calendar.model.Event;
import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class GoogleCalendarSyncServiceTest {

    private static final Long USER_ID = 1L;
    private static final Long CONNECTION_ID = 10L;
    private static final String CALENDAR_ID = "careerdock-calendar-id";

    @Mock private CalendarConnectionRepository connectionRepository;
    @Mock private RecruitmentEventRepository eventRepository;
    @Mock private UserRepository userRepository;
    @Mock private GoogleOAuthService googleOAuthService;
    @Mock private GoogleCalendarApiClient apiClient;
    @Mock private GoogleTokenCipher tokenCipher;

    private GoogleCalendarSyncService syncService;
    private User user;
    private CalendarConnection connection;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties(URI.create("http://localhost:3000"));
        syncService = new GoogleCalendarSyncService(
                connectionRepository, eventRepository, userRepository,
                googleOAuthService, apiClient, tokenCipher, appProperties
        );

        user = User.createGoogleUser("google-subject", "user@example.com", "사용자", null);
        ReflectionTestUtils.setField(user, "id", USER_ID);

        connection = CalendarConnection.connect(user, null, "encrypted-refresh", "encrypted-access", null);
        ReflectionTestUtils.setField(connection, "id", CONNECTION_ID);
        connection.markConnected(CALENDAR_ID);

        // buildCredential은 저장된 토큰을 그대로 감싸는 껍데기라, sync 로직 테스트에서는
        // 어떤 Credential이 오든 동일하게 다룬다. Google 호출 자체를 스킵하는 테스트(연결 없음 등)는
        // 이 스텁을 쓰지 않으므로 lenient로 둔다.
        lenient().when(googleOAuthService.buildCredential(any(), any(), any(), any())).thenReturn(mock(Credential.class));
    }

    private RecruitmentEvent newEvent() {
        RecruitmentEvent event = RecruitmentEvent.create(
                user, null, EventType.PERSONAL_PREPARATION, "면접 준비",
                Instant.now(), Instant.now().plusSeconds(3600), false, null, null, null
        );
        ReflectionTestUtils.setField(event, "id", 100L);
        return event;
    }

    @Test
    void pushUpsertSkipsGoogleCallWhenNotConnected() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        RecruitmentEvent event = newEvent();

        syncService.pushUpsert(event);

        assertThat(event.getSyncStatus()).isEqualTo(SyncStatus.NOT_CONNECTED);
        verify(apiClient, never()).insertEvent(any(), any(), any());
    }

    @Test
    void pushUpsertCreatesGoogleEventForNewEvent() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.of(connection));
        RecruitmentEvent event = newEvent();
        Event googleEvent = new Event().setId("google-event-1");
        when(apiClient.insertEvent(any(), eq(CALENDAR_ID), eq(event))).thenReturn(googleEvent);

        syncService.pushUpsert(event);

        assertThat(event.getSyncStatus()).isEqualTo(SyncStatus.SYNCED);
        assertThat(event.getGoogleEventId()).isEqualTo("google-event-1");
        assertThat(connection.getStatus()).isEqualTo(SyncStatus.SYNCED);
        verify(apiClient, never()).updateEvent(any(), any(), any(), any());
    }

    @Test
    void pushUpsertUpdatesExistingGoogleEvent() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.of(connection));
        RecruitmentEvent event = newEvent();
        event.markSynced("existing-google-event-id");
        Event googleEvent = new Event().setId("existing-google-event-id");
        when(apiClient.updateEvent(any(), eq(CALENDAR_ID), eq("existing-google-event-id"), eq(event)))
                .thenReturn(googleEvent);

        syncService.pushUpsert(event);

        assertThat(event.getSyncStatus()).isEqualTo(SyncStatus.SYNCED);
        verify(apiClient, never()).insertEvent(any(), any(), any());
    }

    @Test
    void pushUpsertMarksEventFailedWithoutThrowingWhenGoogleApiFails() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.of(connection));
        RecruitmentEvent event = newEvent();
        when(apiClient.insertEvent(any(), any(), any()))
                .thenThrow(new CareerdockException(ErrorCode.GOOGLE_RATE_LIMITED, "rate limited"));

        syncService.pushUpsert(event);

        assertThat(event.getSyncStatus()).isEqualTo(SyncStatus.FAILED);
        assertThat(event.getSyncFailureReason()).isEqualTo("GOOGLE_RATE_LIMITED");
        assertThat(connection.getStatus()).isEqualTo(SyncStatus.FAILED);
    }

    @Test
    void pushUpsertClearsGoogleLinkWhenOnlyTheEventWasDeletedOnGoogleSide() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.of(connection));
        RecruitmentEvent event = newEvent();
        event.markSynced("deleted-on-google-side");
        when(apiClient.updateEvent(any(), any(), any(), any())).thenThrow(new GoogleResourceNotFoundException());
        // 복구 확인 시 캘린더는 그대로 있다고 응답 -> 캘린더가 아니라 이벤트만 사라진 경우
        when(apiClient.findOrCreateCalendar(any(), eq(CALENDAR_ID))).thenReturn(CALENDAR_ID);

        syncService.pushUpsert(event);

        assertThat(event.getGoogleEventId()).isNull();
        assertThat(event.getSyncStatus()).isEqualTo(SyncStatus.FAILED);
        assertThat(event.getSyncFailureReason()).isEqualTo("GOOGLE_EVENT_NOT_FOUND");
    }

    @Test
    void pushUpsertRecreatesCalendarAndRetriesWhenCalendarItselfWasDeleted() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.of(connection));
        RecruitmentEvent event = newEvent();
        event.markSynced("orphaned-event-id");
        when(apiClient.updateEvent(any(), eq(CALENDAR_ID), any(), any())).thenThrow(new GoogleResourceNotFoundException());
        // 복구 확인 시 캘린더 자체가 새로 생성됨 -> 다른 id
        String recreatedCalendarId = "recreated-calendar-id";
        when(apiClient.findOrCreateCalendar(any(), eq(CALENDAR_ID))).thenReturn(recreatedCalendarId);
        Event retriedGoogleEvent = new Event().setId("new-google-event-id");
        when(apiClient.insertEvent(any(), eq(recreatedCalendarId), eq(event))).thenReturn(retriedGoogleEvent);

        syncService.pushUpsert(event);

        assertThat(event.getSyncStatus()).isEqualTo(SyncStatus.SYNCED);
        assertThat(event.getGoogleEventId()).isEqualTo("new-google-event-id");
        assertThat(connection.getGoogleCalendarId()).isEqualTo(recreatedCalendarId);
    }

    @Test
    void pushDeleteDoesNothingWhenEventWasNeverSynced() {
        RecruitmentEvent event = newEvent();

        syncService.pushDelete(event);

        verify(connectionRepository, never()).findByUserId(any());
    }

    @Test
    void pushDeleteCallsGoogleWhenEventWasSynced() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.of(connection));
        RecruitmentEvent event = newEvent();
        event.markSynced("google-event-to-delete");

        syncService.pushDelete(event);

        verify(apiClient).deleteEvent(any(), eq(CALENDAR_ID), eq("google-event-to-delete"));
    }

    @Test
    void pushDeleteSwallowsNotFoundSinceGoalIsAlreadyAchieved() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.of(connection));
        RecruitmentEvent event = newEvent();
        event.markSynced("already-gone");
        org.mockito.Mockito.doThrow(new GoogleResourceNotFoundException())
                .when(apiClient).deleteEvent(any(), any(), any());

        syncService.pushDelete(event);
        // 예외가 여기까지 올라오지 않으면 성공 — CalendarService의 로컬 삭제를 막지 않는다.
    }

    @Test
    void retrySyncThrowsWhenNotConnected() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> syncService.retrySync(USER_ID))
                .isInstanceOf(CareerdockException.class)
                .satisfies(exception ->
                        assertThat(((CareerdockException) exception).errorCode()).isEqualTo(ErrorCode.GOOGLE_NOT_CONNECTED));
    }

    @Test
    void retrySyncRetriesFailedAndNotConnectedEvents() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.of(connection));
        RecruitmentEvent failedEvent = newEvent();
        failedEvent.markSyncFailed("GOOGLE_API_ERROR");
        when(eventRepository.findByUserIdAndSyncStatusIn(
                eq(USER_ID), eq(List.of(SyncStatus.NOT_CONNECTED, SyncStatus.FAILED)), any()))
                .thenReturn(List.of(failedEvent));
        when(apiClient.insertEvent(any(), eq(CALENDAR_ID), eq(failedEvent)))
                .thenReturn(new Event().setId("retried-event-id"));

        CalendarSyncResponse response = syncService.retrySync(USER_ID);

        assertThat(response.attempted()).isEqualTo(1);
        assertThat(response.synced()).isEqualTo(1);
        assertThat(response.failed()).isEqualTo(0);
        assertThat(failedEvent.getSyncStatus()).isEqualTo(SyncStatus.SYNCED);
    }

    @Test
    void disconnectRevokesTokenDeletesConnectionAndResetsEvents() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.of(connection));
        when(tokenCipher.decrypt("encrypted-refresh")).thenReturn("plain-refresh-token");
        RecruitmentEvent syncedEvent = newEvent();
        syncedEvent.markSynced("google-event-id");
        when(eventRepository.findByUserIdAndSyncStatusIn(
                eq(USER_ID), eq(List.of(SyncStatus.SYNCED, SyncStatus.FAILED)), eq(Pageable.unpaged())))
                .thenReturn(List.of(syncedEvent));

        syncService.disconnect(USER_ID);

        verify(googleOAuthService).revoke("plain-refresh-token");
        verify(connectionRepository).delete(connection);
        assertThat(syncedEvent.getSyncStatus()).isEqualTo(SyncStatus.NOT_CONNECTED);
        assertThat(syncedEvent.getGoogleEventId()).isNull();
    }

    @Test
    void disconnectIsNoOpWhenAlreadyDisconnected() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        syncService.disconnect(USER_ID);

        verify(connectionRepository, never()).delete(any());
        verify(googleOAuthService, never()).revoke(anyString());
    }

    @Test
    void statusReturnsNotConnectedWhenNoConnectionExists() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(eventRepository.findSyncStatusesByUserId(USER_ID)).thenReturn(List.of());

        CalendarStatusResponse response = syncService.status(USER_ID);

        assertThat(response.connected()).isFalse();
    }

    @Test
    void statusReflectsConnectionAndEventCounts() {
        when(connectionRepository.findByUserId(USER_ID)).thenReturn(Optional.of(connection));
        when(eventRepository.findSyncStatusesByUserId(USER_ID))
                .thenReturn(List.of(SyncStatus.SYNCED, SyncStatus.SYNCED, SyncStatus.FAILED));

        CalendarStatusResponse response = syncService.status(USER_ID);

        assertThat(response.connected()).isTrue();
        assertThat(response.status()).isEqualTo(SyncStatus.SYNCED);
        assertThat(response.eventCounts().get(SyncStatus.SYNCED)).isEqualTo(2L);
        assertThat(response.eventCounts().get(SyncStatus.FAILED)).isEqualTo(1L);
    }
}
