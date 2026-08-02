package com.careerdock.calendar.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.RecruitmentSeason;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.calendar.repository.RecruitmentEventRepository;
import com.careerdock.company.domain.Company;
import com.careerdock.company.repository.CompanyRepository;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CalendarControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private RecruitmentEventRepository eventRepository;

    private User owner;
    private User otherUser;
    private Application ownerApplication;
    private Application otherApplication;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");

        owner = userRepository.save(User.createGoogleUser("calendar-subject-1", "owner@example.com", "본인", null));
        otherUser = userRepository.save(User.createGoogleUser("calendar-subject-2", "other@example.com", "타인", null));
        ownerApplication = saveApplication(owner, "KB국민은행", "IT 개발");
        otherApplication = saveApplication(otherUser, "타인은행", "타인 직무");
    }

    @Test
    void createsPersonalEventWithDefaultReminderRules() throws Exception {
        mockMvc.perform(post("/api/calendar/events")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "eventType":"PERSONAL_PREPARATION",
                                  "title":"NCS 문제집 풀기",
                                  "startAt":"2026-09-01T10:00:00Z"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.applicationId").doesNotExist())
                .andExpect(jsonPath("$.companyName").doesNotExist())
                // 종료를 비우면 시작과 같은 시각으로 채운다.
                .andExpect(jsonPath("$.endAt").value("2026-09-01T10:00:00Z"))
                .andExpect(jsonPath("$.syncStatus").value("NOT_CONNECTED"))
                .andExpect(jsonPath("$.googleEventId").doesNotExist())
                .andExpect(jsonPath("$.reminderRules.length()").value(4))
                .andExpect(jsonPath("$.reminderRules[0].minutesBefore").value(10080))
                .andExpect(jsonPath("$.reminderRules[3].minutesBefore").value(180))
                .andExpect(jsonPath("$.reminderRules[0].channel").value("INTERNAL"))
                .andExpect(jsonPath("$.reminderRules[0].enabled").value(true));
    }

    @Test
    void createsEventLinkedToOwnApplication() throws Exception {
        mockMvc.perform(post("/api/calendar/events")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "applicationId":%d,
                                  "eventType":"FIRST_INTERVIEW",
                                  "title":"1차 면접",
                                  "startAt":"2026-09-10T01:00:00Z",
                                  "endAt":"2026-09-10T02:00:00Z",
                                  "location":"여의도 본점",
                                  "onlineUrl":"https://example.com/meet",
                                  "memo":"포트폴리오 지참",
                                  "reminderRules":[{"minutesBefore":1440}]
                                }
                                """.formatted(ownerApplication.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.applicationId").value(ownerApplication.getId()))
                .andExpect(jsonPath("$.companyName").value("KB국민은행"))
                .andExpect(jsonPath("$.positionName").value("IT 개발"))
                .andExpect(jsonPath("$.reminderRules.length()").value(1));
    }

    @Test
    void treatsAllDayEventAsWholeKoreanDay() throws Exception {
        // 한국 시간 2026-09-05 14:00에 해당하는 시각을 보내도 그 날 하루 전체가 된다.
        long eventId = createEvent(owner, """
                {
                  "eventType":"APPLICATION_DEADLINE",
                  "title":"서류 마감",
                  "startAt":"2026-09-05T05:00:00Z",
                  "allDay":true
                }
                """);

        mockMvc.perform(get("/api/calendar/events/{id}", eventId).with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allDay").value(true))
                .andExpect(jsonPath("$.startAt").value("2026-09-04T15:00:00Z"))
                .andExpect(jsonPath("$.endAt").value("2026-09-05T14:59:59Z"));
    }

    @Test
    void findsEventsOverlappingMonthlyRange() throws Exception {
        createEvent(owner, event("8월 안쪽", "2026-08-10T01:00:00Z", "2026-08-10T02:00:00Z"));
        createEvent(owner, event("8월과 9월 경계", "2026-08-31T01:00:00Z", "2026-09-02T01:00:00Z"));
        createEvent(owner, event("9월", "2026-09-15T01:00:00Z", "2026-09-15T02:00:00Z"));

        mockMvc.perform(get("/api/calendar/events")
                        .param("start", "2026-08-01T00:00:00Z")
                        .param("end", "2026-08-31T23:59:59Z")
                        .with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("8월 안쪽"))
                .andExpect(jsonPath("$[1].title").value("8월과 9월 경계"));
    }

    @Test
    void sortsUpcomingEventsAndAppliesLimit() throws Exception {
        createEvent(owner, event("지난 일정", "2020-01-01T00:00:00Z", "2020-01-01T01:00:00Z"));
        createEvent(owner, event("나중", "2030-03-01T00:00:00Z", "2030-03-01T01:00:00Z"));
        createEvent(owner, event("먼저", "2030-01-01T00:00:00Z", "2030-01-01T01:00:00Z"));
        createEvent(owner, event("중간", "2030-02-01T00:00:00Z", "2030-02-01T01:00:00Z"));

        mockMvc.perform(get("/api/calendar/events")
                        .param("upcoming", "true")
                        .with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].title").value("먼저"))
                .andExpect(jsonPath("$[1].title").value("중간"))
                .andExpect(jsonPath("$[2].title").value("나중"));

        mockMvc.perform(get("/api/calendar/events")
                        .param("upcoming", "true")
                        .param("limit", "2")
                        .with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("먼저"));
    }

    @Test
    void filtersByApplicationAndEventType() throws Exception {
        createEvent(owner, """
                {
                  "applicationId":%d,
                  "eventType":"CODING_TEST",
                  "title":"코딩테스트",
                  "startAt":"2026-09-20T01:00:00Z"
                }
                """.formatted(ownerApplication.getId()));
        createEvent(owner, event("개인 준비", "2026-09-21T01:00:00Z", "2026-09-21T02:00:00Z"));

        mockMvc.perform(get("/api/calendar/events")
                        .param("applicationId", String.valueOf(ownerApplication.getId()))
                        .with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("코딩테스트"));

        mockMvc.perform(get("/api/calendar/events")
                        .param("eventType", "PERSONAL_PREPARATION")
                        .with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("개인 준비"));
    }

    @Test
    void updatesEventAndReplacesReminderRules() throws Exception {
        long eventId = createEvent(owner, event("1차 면접", "2026-09-10T01:00:00Z", "2026-09-10T02:00:00Z"));

        mockMvc.perform(patch("/api/calendar/events/{id}", eventId)
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "applicationId":%d,
                                  "eventType":"SECOND_INTERVIEW",
                                  "title":"2차 면접",
                                  "startAt":"2026-09-12T01:00:00Z",
                                  "endAt":"2026-09-12T03:00:00Z",
                                  "reminderRules":[{"minutesBefore":60,"channel":"EMAIL","enabled":false}]
                                }
                                """.formatted(ownerApplication.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventType").value("SECOND_INTERVIEW"))
                .andExpect(jsonPath("$.title").value("2차 면접"))
                .andExpect(jsonPath("$.applicationId").value(ownerApplication.getId()))
                .andExpect(jsonPath("$.reminderRules.length()").value(1))
                .andExpect(jsonPath("$.reminderRules[0].minutesBefore").value(60))
                .andExpect(jsonPath("$.reminderRules[0].channel").value("EMAIL"))
                .andExpect(jsonPath("$.reminderRules[0].enabled").value(false));

        Integer remainingRules = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM reminder_rules", Integer.class);
        assertThat(remainingRules).isEqualTo(1);
    }

    @Test
    void deletesEventWithItsReminderRules() throws Exception {
        long eventId = createEvent(owner, event("삭제 대상", "2026-09-10T01:00:00Z", "2026-09-10T02:00:00Z"));

        mockMvc.perform(delete("/api/calendar/events/{id}", eventId).with(authentication(auth(owner))))
                .andExpect(status().isNoContent());

        assertThat(eventRepository.count()).isZero();
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM reminder_rules", Integer.class)).isZero();
    }

    @Test
    void rejectsEndBeforeStart() throws Exception {
        mockMvc.perform(post("/api/calendar/events")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(event("거꾸로", "2026-09-10T05:00:00Z", "2026-09-10T01:00:00Z")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));

        assertThat(eventRepository.count()).isZero();
    }

    @Test
    void rejectsBlankTitleAndNegativeReminder() throws Exception {
        mockMvc.perform(post("/api/calendar/events")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "eventType":"CODING_TEST",
                                  "title":"   ",
                                  "startAt":"2026-09-10T01:00:00Z"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.title").exists());

        mockMvc.perform(post("/api/calendar/events")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "eventType":"CODING_TEST",
                                  "title":"코딩테스트",
                                  "startAt":"2026-09-10T01:00:00Z",
                                  "reminderRules":[{"minutesBefore":-10}]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void rejectsDuplicateReminderRule() throws Exception {
        mockMvc.perform(post("/api/calendar/events")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "eventType":"FINAL_INTERVIEW",
                                  "title":"최종 면접",
                                  "startAt":"2026-09-10T01:00:00Z",
                                  "reminderRules":[
                                    {"minutesBefore":1440,"channel":"INTERNAL"},
                                    {"minutesBefore":1440,"channel":"INTERNAL"}
                                  ]
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DUPLICATE_RESOURCE"));

        assertThat(eventRepository.count()).isZero();
    }

    @Test
    void rejectsLinkingSomeoneElsesApplication() throws Exception {
        mockMvc.perform(post("/api/calendar/events")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "applicationId":%d,
                                  "eventType":"FIRST_INTERVIEW",
                                  "title":"남의 지원 건 면접",
                                  "startAt":"2026-09-10T01:00:00Z"
                                }
                                """.formatted(otherApplication.getId())))
                .andExpect(status().isNotFound());

        assertThat(eventRepository.count()).isZero();
    }

    @Test
    void hidesOtherUsersEvent() throws Exception {
        long eventId = createEvent(owner, event("본인 일정", "2026-09-10T01:00:00Z", "2026-09-10T02:00:00Z"));

        mockMvc.perform(get("/api/calendar/events/{id}", eventId).with(authentication(auth(otherUser))))
                .andExpect(status().isNotFound());
        mockMvc.perform(patch("/api/calendar/events/{id}", eventId)
                        .with(authentication(auth(otherUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(event("가로채기", "2026-09-10T01:00:00Z", "2026-09-10T02:00:00Z")))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/calendar/events/{id}", eventId).with(authentication(auth(otherUser))))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/calendar/events").with(authentication(auth(otherUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        assertThat(eventRepository.count()).isEqualTo(1);
    }

    private String event(String title, String startAt, String endAt) {
        return """
                {
                  "eventType":"PERSONAL_PREPARATION",
                  "title":"%s",
                  "startAt":"%s",
                  "endAt":"%s"
                }
                """.formatted(title, startAt, endAt);
    }

    private long createEvent(User user, String body) throws Exception {
        String response = mockMvc.perform(post("/api/calendar/events")
                        .with(authentication(auth(user)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private Application saveApplication(User user, String companyName, String positionName) {
        Company company = companyRepository.save(Company.create(user, companyName, null, null));
        return applicationRepository.save(Application.create(
                user,
                company,
                positionName,
                "2026 하반기",
                2026,
                RecruitmentSeason.SECOND_HALF,
                null,
                null,
                Instant.parse("2026-09-30T00:00:00Z"),
                ApplicationStatus.WRITING,
                null,
                null,
                null
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
