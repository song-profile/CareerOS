package com.careerdock.calendar.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.calendar.domain.CalendarConnection;
import com.careerdock.calendar.domain.EventType;
import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.calendar.domain.SyncStatus;
import com.careerdock.calendar.repository.CalendarConnectionRepository;
import com.careerdock.calendar.repository.RecruitmentEventRepository;
import com.careerdock.calendar.service.GoogleCalendarApiClient;
import com.careerdock.calendar.service.GoogleOAuthService;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.services.calendar.model.Event;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Google과의 실제 통신({@link GoogleOAuthService}, {@link GoogleCalendarApiClient})은 mock으로
 * 대체해 네트워크 호출 없이 connect→state 검증→callback→암호화 저장, status/sync/disconnect/
 * test-event 경로를 검증한다. 실제 Google API 동작 자체는 이 테스트의 범위가 아니다.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GoogleCalendarControllerTest {

    private static final String OAUTH_STATE_SESSION_KEY = "google_calendar_oauth_state";

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private CalendarConnectionRepository connectionRepository;
    @Autowired private RecruitmentEventRepository eventRepository;

    @MockBean private GoogleOAuthService googleOAuthService;
    @MockBean private GoogleCalendarApiClient apiClient;

    private User owner;
    private User otherUser;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");
        owner = userRepository.save(User.createGoogleUser("gcal-subject-1", "owner@example.com", "본인", null));
        otherUser = userRepository.save(User.createGoogleUser("gcal-subject-2", "other@example.com", "타인", null));
    }

    @Test
    void connectReturnsAuthorizationUrlAndStoresStateInSession() throws Exception {
        when(googleOAuthService.buildAuthorizationUrl(anyString())).thenReturn("https://accounts.google.com/authorize?state=x");

        MvcResult result = mockMvc.perform(post("/api/calendar/connect").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorizationUrl").value("https://accounts.google.com/authorize?state=x"))
                .andReturn();

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession();
        assertThat(session.getAttribute(OAUTH_STATE_SESSION_KEY)).isNotNull();
    }

    @Test
    void callbackPersistsEncryptedConnectionAndRedirectsToFrontendOnSuccess() throws Exception {
        when(googleOAuthService.buildAuthorizationUrl(anyString())).thenReturn("https://accounts.google.com/authorize");
        MockHttpSession session = startConnectAndCaptureSession();
        String state = (String) session.getAttribute(OAUTH_STATE_SESSION_KEY);

        GoogleTokenResponse tokenResponse = new GoogleTokenResponse();
        tokenResponse.setAccessToken("raw-access-token");
        tokenResponse.setRefreshToken("raw-refresh-token");
        tokenResponse.setExpiresInSeconds(3600L);
        when(googleOAuthService.exchangeCode("auth-code")).thenReturn(tokenResponse);
        when(apiClient.findOrCreateCalendar(any(), any())).thenReturn("google-calendar-id-1");

        mockMvc.perform(get("/api/calendar/oauth/callback")
                        .param("code", "auth-code")
                        .param("state", state)
                        .session(session)
                        .with(authentication(auth(owner))))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", "http://localhost:3000/settings/calendar?connected=true"));

        CalendarConnection saved = connectionRepository.findByUserId(owner.getId()).orElseThrow();
        assertThat(saved.getGoogleCalendarId()).isEqualTo("google-calendar-id-1");
        assertThat(saved.getStatus()).isEqualTo(SyncStatus.SYNCED);
        // 토큰은 절대 평문으로 저장되지 않는다.
        assertThat(saved.getRefreshTokenEncrypted()).isNotEqualTo("raw-refresh-token");
        assertThat(saved.getAccessTokenEncrypted()).isNotEqualTo("raw-access-token");
    }

    @Test
    void callbackRejectsMismatchedStateWithoutPersistingAnything() throws Exception {
        when(googleOAuthService.buildAuthorizationUrl(anyString())).thenReturn("https://accounts.google.com/authorize");
        MockHttpSession session = startConnectAndCaptureSession();

        mockMvc.perform(get("/api/calendar/oauth/callback")
                        .param("code", "auth-code")
                        .param("state", "forged-state-value")
                        .session(session)
                        .with(authentication(auth(owner))))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", "http://localhost:3000/settings/calendar?connected=false&reason=INVALID_REQUEST"));

        assertThat(connectionRepository.findByUserId(owner.getId())).isEmpty();
    }

    @Test
    void statusReportsNotConnectedWhenNoConnectionExists() throws Exception {
        mockMvc.perform(get("/api/calendar/status").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connected").value(false));
    }

    @Test
    void statusReportsConnectionAndPerUserEventCounts() throws Exception {
        saveConnection(owner, "calendar-1");
        RecruitmentEvent syncedEvent = saveEvent(owner, "동기화됨");
        syncedEvent.markSynced("g-1");
        eventRepository.save(syncedEvent);

        mockMvc.perform(get("/api/calendar/status").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connected").value(true))
                .andExpect(jsonPath("$.status").value("SYNCED"))
                .andExpect(jsonPath("$.eventCounts.SYNCED").value(1));

        // 남의 연결 상태는 보이지 않는다.
        mockMvc.perform(get("/api/calendar/status").with(authentication(auth(otherUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connected").value(false));
    }

    @Test
    void syncFailsWithConflictWhenNotConnected() throws Exception {
        mockMvc.perform(post("/api/calendar/sync").with(authentication(auth(owner))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("GOOGLE_NOT_CONNECTED"));
    }

    @Test
    void syncRetriesFailedEvents() throws Exception {
        saveConnection(owner, "calendar-1");
        RecruitmentEvent failedEvent = saveEvent(owner, "재시도 대상");
        failedEvent.markSyncFailed("GOOGLE_API_ERROR");
        eventRepository.save(failedEvent);
        when(apiClient.insertEvent(any(), any(), any())).thenReturn(new Event().setId("retried-id"));

        mockMvc.perform(post("/api/calendar/sync").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attempted").value(1))
                .andExpect(jsonPath("$.synced").value(1))
                .andExpect(jsonPath("$.failed").value(0));
    }

    @Test
    void disconnectRevokesTokenAndResetsEvents() throws Exception {
        saveConnection(owner, "calendar-1");
        RecruitmentEvent syncedEvent = saveEvent(owner, "연결 해제 대상");
        syncedEvent.markSynced("g-1");
        eventRepository.save(syncedEvent);

        mockMvc.perform(delete("/api/calendar/disconnect").with(authentication(auth(owner))))
                .andExpect(status().isNoContent());

        assertThat(connectionRepository.findByUserId(owner.getId())).isEmpty();
        verify(googleOAuthService).revoke(anyString());
        RecruitmentEvent reloaded = eventRepository.findById(syncedEvent.getId()).orElseThrow();
        assertThat(reloaded.getSyncStatus()).isEqualTo(SyncStatus.NOT_CONNECTED);
        assertThat(reloaded.getGoogleEventId()).isNull();
    }

    @Test
    void testEventFailsWithConflictWhenNotConnected() throws Exception {
        mockMvc.perform(post("/api/calendar/test-event").with(authentication(auth(owner))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("GOOGLE_NOT_CONNECTED"));
    }

    @Test
    void testEventCreatesThrowawayEventWithoutTouchingRecruitmentEvents() throws Exception {
        saveConnection(owner, "calendar-1");
        when(apiClient.insertTestEvent(any(), any()))
                .thenReturn(new Event().setId("test-event-id").setHtmlLink("https://calendar.google.com/event?eid=x"));

        mockMvc.perform(post("/api/calendar/test-event").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.googleEventId").value("test-event-id"))
                .andExpect(jsonPath("$.htmlLink").value("https://calendar.google.com/event?eid=x"));

        assertThat(eventRepository.count()).isZero();
    }

    private MockHttpSession startConnectAndCaptureSession() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/calendar/connect").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession();
    }

    private CalendarConnection saveConnection(User user, String calendarId) {
        CalendarConnection connection = CalendarConnection.connect(
                user, null, "encrypted-refresh-token", "encrypted-access-token", Instant.now().plusSeconds(3600));
        connection.markConnected(calendarId);
        return connectionRepository.save(connection);
    }

    private RecruitmentEvent saveEvent(User user, String title) {
        return eventRepository.save(RecruitmentEvent.create(
                user, null, EventType.PERSONAL_PREPARATION, title,
                Instant.now(), Instant.now().plusSeconds(3600), false, null, null, null
        ));
    }

    private Authentication auth(User user) {
        LoginUser loginUser = new LoginUser(user.getId(), user.getEmail(), user.getName(), null, AuthProvider.GOOGLE);
        CareerdockOAuth2User principal = new CareerdockOAuth2User(
                loginUser,
                Map.of("sub", user.getProviderUserId()),
                List.of(),
                "sub"
        );
        return new TestingAuthenticationToken(principal, null, "ROLE_USER");
    }
}
