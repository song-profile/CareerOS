package com.careerdock.dashboard.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.RecruitmentSeason;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.calendar.domain.CalendarConnection;
import com.careerdock.calendar.domain.EventType;
import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.calendar.domain.SyncStatus;
import com.careerdock.calendar.repository.CalendarConnectionRepository;
import com.careerdock.calendar.repository.RecruitmentEventRepository;
import com.careerdock.company.domain.Company;
import com.careerdock.company.repository.CompanyRepository;
import com.careerdock.essay.domain.CommonQuestionType;
import com.careerdock.essay.domain.EssayAnswer;
import com.careerdock.essay.domain.EssayQuestion;
import com.careerdock.essay.repository.EssayAnswerRepository;
import com.careerdock.essay.repository.EssayQuestionRepository;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.notification.domain.Notification;
import com.careerdock.notification.domain.NotificationType;
import com.careerdock.notification.repository.NotificationRepository;
import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DashboardControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private RecruitmentEventRepository eventRepository;
    @Autowired private CalendarConnectionRepository connectionRepository;
    @Autowired private EssayQuestionRepository essayQuestionRepository;
    @Autowired private EssayAnswerRepository essayAnswerRepository;
    @Autowired private NotificationRepository notificationRepository;

    private User owner;
    private User otherUser;
    private Instant now;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");

        owner = userRepository.save(User.createGoogleUser("dashboard-owner", "owner@example.com", "본인", null));
        otherUser = userRepository.save(User.createGoogleUser("dashboard-other", "other@example.com", "타인", null));
        now = Instant.now();
    }

    @Test
    void summaryRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void returnsEmptySummaryWhenUserHasNoData() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.weeklyDeadlineCount").value(0))
                .andExpect(jsonPath("$.summary.upcomingEventCount").value(0))
                .andExpect(jsonPath("$.summary.draftingApplicationCount").value(0))
                .andExpect(jsonPath("$.upcomingDeadlines.length()").value(0))
                .andExpect(jsonPath("$.upcomingEvents.length()").value(0))
                .andExpect(jsonPath("$.todayEvents.length()").value(0))
                .andExpect(jsonPath("$.weekEvents.length()").value(0))
                .andExpect(jsonPath("$.googleCalendar.connected").value(false))
                .andExpect(jsonPath("$.preparationItems.length()").value(0))
                .andExpect(jsonPath("$.importantNotifications.length()").value(0));
    }

    @Test
    void returnsOnlyLoggedInUsersDashboardData() throws Exception {
        saveApplication(owner, "KB국민은행", "IT 개발", now.plusSeconds(days(2)), ApplicationStatus.WRITING);
        Application otherApplication = saveApplication(
                otherUser,
                "타인은행",
                "타인 직무",
                now.plusSeconds(days(1)),
                ApplicationStatus.WRITING
        );
        saveEvent(otherUser, otherApplication, "타인 일정", now.plusSeconds(days(1)));

        mockMvc.perform(get("/api/dashboard/summary").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.weeklyDeadlineCount").value(1))
                .andExpect(jsonPath("$.summary.upcomingEventCount").value(0))
                .andExpect(jsonPath("$.summary.draftingApplicationCount").value(1))
                .andExpect(jsonPath("$.upcomingDeadlines.length()").value(1))
                .andExpect(jsonPath("$.upcomingDeadlines[0].companyName").value("KB국민은행"))
                .andExpect(jsonPath("$.upcomingEvents.length()").value(0))
                .andExpect(jsonPath("$.todayEvents.length()").value(0))
                .andExpect(jsonPath("$.weekEvents.length()").value(0))
                .andExpect(jsonPath("$.importantNotifications.length()").value(0));
    }

    @Test
    void returnsTodayAndWeekEventsWithGoogleSyncStatus() throws Exception {
        Application application = saveApplication(owner, "삼성전자", "플랫폼 개발", now.plusSeconds(days(1)), ApplicationStatus.WRITING);
        RecruitmentEvent synced = saveEvent(owner, application, "오늘 코딩테스트", now.plusSeconds(3600));
        synced.markSynced("google-event-1");
        eventRepository.save(synced);
        RecruitmentEvent failed = saveEvent(owner, application, "내일 면접", now.plusSeconds(days(1)));
        failed.markSyncFailed("GOOGLE_API_ERROR");
        eventRepository.save(failed);
        saveEvent(owner, application, "8일 뒤 일정", now.plusSeconds(days(8)));
        CalendarConnection connection = CalendarConnection.connect(
                owner,
                "owner@example.com",
                "encrypted-refresh-token",
                "encrypted-access-token",
                now.plusSeconds(3600)
        );
        connection.markSynced();
        connectionRepository.save(connection);

        mockMvc.perform(get("/api/dashboard/summary").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.todayEvents.length()").value(1))
                .andExpect(jsonPath("$.todayEvents[0].title").value("오늘 코딩테스트"))
                .andExpect(jsonPath("$.weekEvents.length()").value(2))
                .andExpect(jsonPath("$.googleCalendar.connected").value(true))
                .andExpect(jsonPath("$.googleCalendar.autoSyncEnabled").value(true))
                .andExpect(jsonPath("$.googleCalendar.syncedCount").value(1))
                .andExpect(jsonPath("$.googleCalendar.failedCount").value(1));
    }

    @Test
    void returnsPreparationItemsAndImportantNotifications() throws Exception {
        Application application = saveApplication(owner, "KB국민은행", "IT 개발", now.plusSeconds(days(1)), ApplicationStatus.WRITING);
        EssayQuestion firstQuestion = essayQuestionRepository.save(EssayQuestion.create(
                application,
                1,
                "지원동기",
                700,
                CommonQuestionType.MOTIVATION
        ));
        essayQuestionRepository.save(EssayQuestion.create(
                application,
                2,
                "협업 경험",
                700,
                CommonQuestionType.COLLABORATION
        ));
        essayAnswerRepository.save(EssayAnswer.draft(firstQuestion, owner, "답변", 1));
        saveEvent(owner, application, "지원 마감", now.plusSeconds(days(1)));
        notificationRepository.save(Notification.create(
                owner,
                NotificationType.APPLICATION_DEADLINE,
                "지원 마감 D-1",
                "KB국민은행 마감이 임박했습니다.",
                "/applications/" + application.getId(),
                "APPLICATION",
                application.getId(),
                "dashboard-test-" + application.getId()
        ));

        mockMvc.perform(get("/api/dashboard/summary").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preparationItems.length()").value(1))
                .andExpect(jsonPath("$.preparationItems[0].companyName").value("KB국민은행"))
                .andExpect(jsonPath("$.preparationItems[0].essayQuestionCount").value(2))
                .andExpect(jsonPath("$.preparationItems[0].essayAnswerCount").value(1))
                .andExpect(jsonPath("$.preparationItems[0].materialCount").value(0))
                .andExpect(jsonPath("$.preparationItems[0].eventCount").value(1))
                .andExpect(jsonPath("$.importantNotifications.length()").value(1))
                .andExpect(jsonPath("$.importantNotifications[0].title").value("지원 마감 D-1"));
    }

    @Test
    void excludesEndedEventsAndExpiredDeadlinesFromImportantNotifications() throws Exception {
        Application expiredApplication = saveApplication(
                owner,
                "지난마감",
                "백엔드",
                now.minusSeconds(days(1)),
                ApplicationStatus.WRITING
        );
        RecruitmentEvent endedEvent = saveEvent(owner, expiredApplication, "지난 면접", now.minusSeconds(days(1)));
        notificationRepository.save(Notification.create(
                owner,
                NotificationType.INTERVIEW,
                "면접 오늘",
                "지난 면접 일정이 오늘입니다.",
                "/calendar/" + endedEvent.getId(),
                "CALENDAR_EVENT",
                endedEvent.getId(),
                "ended-event-" + endedEvent.getId()
        ));
        notificationRepository.save(Notification.create(
                owner,
                NotificationType.APPLICATION_DEADLINE,
                "지원 마감 오늘",
                "지난마감 백엔드 지원 마감이 오늘입니다.",
                "/applications/" + expiredApplication.getId(),
                "APPLICATION",
                expiredApplication.getId(),
                "expired-deadline-" + expiredApplication.getId()
        ));

        Application activeApplication = saveApplication(
                owner,
                "예정마감",
                "프론트엔드",
                now.plusSeconds(days(1)),
                ApplicationStatus.WRITING
        );
        RecruitmentEvent activeEvent = saveEvent(owner, activeApplication, "예정 면접", now.plusSeconds(days(1)));
        notificationRepository.save(Notification.create(
                owner,
                NotificationType.INTERVIEW,
                "면접 D-1",
                "예정 면접 일정이 D-1입니다.",
                "/calendar/" + activeEvent.getId(),
                "CALENDAR_EVENT",
                activeEvent.getId(),
                "active-event-" + activeEvent.getId()
        ));
        notificationRepository.save(Notification.create(
                owner,
                NotificationType.APPLICATION_DEADLINE,
                "지원 마감 D-1",
                "예정마감 프론트엔드 지원 마감이 D-1입니다.",
                "/applications/" + activeApplication.getId(),
                "APPLICATION",
                activeApplication.getId(),
                "active-deadline-" + activeApplication.getId()
        ));

        mockMvc.perform(get("/api/dashboard/summary").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.importantNotifications.length()").value(2))
                .andExpect(jsonPath("$.importantNotifications[0].title").value("지원 마감 D-1"))
                .andExpect(jsonPath("$.importantNotifications[1].title").value("면접 D-1"));
    }

    @Test
    void calculatesWeeklyDeadlinesAndExcludesNullPastAndFinishedStatuses() throws Exception {
        saveApplication(owner, "이번주1", "백엔드", now.plusSeconds(days(1)), ApplicationStatus.WRITING);
        saveApplication(owner, "이번주2", "프론트엔드", now.plusSeconds(days(7)), ApplicationStatus.SUBMITTED);
        saveApplication(owner, "다음주", "데이터", now.plusSeconds(days(8)), ApplicationStatus.WRITING);
        saveApplication(owner, "마감없음", "기획", null, ApplicationStatus.WRITING);
        saveApplication(owner, "과거", "운영", now.minusSeconds(days(1)), ApplicationStatus.WRITING);
        saveApplication(owner, "합격종료", "보안", now.plusSeconds(days(2)), ApplicationStatus.FINAL_ACCEPTED);
        saveApplication(owner, "불합격종료", "QA", now.plusSeconds(days(3)), ApplicationStatus.FINAL_REJECTED);

        mockMvc.perform(get("/api/dashboard/summary").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.weeklyDeadlineCount").value(2));
    }

    @Test
    void countsDraftingApplicationsByWritingStatus() throws Exception {
        saveApplication(owner, "작성중1", "백엔드", now.plusSeconds(days(10)), ApplicationStatus.WRITING);
        saveApplication(owner, "작성중2", "프론트엔드", null, ApplicationStatus.WRITING);
        saveApplication(owner, "제출", "데이터", now.plusSeconds(days(1)), ApplicationStatus.SUBMITTED);
        saveApplication(otherUser, "타인작성중", "보안", now.plusSeconds(days(1)), ApplicationStatus.WRITING);

        mockMvc.perform(get("/api/dashboard/summary").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.draftingApplicationCount").value(2));
    }

    @Test
    void sortsUpcomingDeadlinesAndAppliesLimit() throws Exception {
        saveApplication(owner, "D5", "개발", now.plusSeconds(days(5)), ApplicationStatus.WRITING);
        saveApplication(owner, "D1", "개발", now.plusSeconds(days(1)), ApplicationStatus.WRITING);
        saveApplication(owner, "D3", "개발", now.plusSeconds(days(3)), ApplicationStatus.INTERVIEW);
        saveApplication(owner, "D2", "개발", now.plusSeconds(days(2)), ApplicationStatus.SUBMITTED);
        saveApplication(owner, "마감없음", "개발", null, ApplicationStatus.WRITING);
        saveApplication(owner, "과거", "개발", now.minusSeconds(days(1)), ApplicationStatus.WRITING);

        mockMvc.perform(get("/api/dashboard/summary").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.upcomingDeadlines.length()").value(3))
                .andExpect(jsonPath("$.upcomingDeadlines[0].companyName").value("D1"))
                .andExpect(jsonPath("$.upcomingDeadlines[1].companyName").value("D2"))
                .andExpect(jsonPath("$.upcomingDeadlines[2].companyName").value("D3"))
                .andExpect(jsonPath("$.upcomingDeadlines[0].deadlineAt").exists())
                .andExpect(jsonPath("$.upcomingDeadlines[0].status").value("WRITING"))
                .andExpect(jsonPath("$.upcomingDeadlines[0].daysUntil").isNumber());
    }

    @Test
    void sortsUpcomingEventsAndExcludesPastEvents() throws Exception {
        Application application = saveApplication(owner, "KB국민은행", "IT 개발", now.plusSeconds(days(2)), ApplicationStatus.WRITING);
        saveEvent(owner, application, "지난 일정", now.minusSeconds(days(1)));
        saveEvent(owner, application, "5번째", now.plusSeconds(days(5)));
        saveEvent(owner, application, "1번째", now.plusSeconds(days(1)));
        saveEvent(owner, application, "3번째", now.plusSeconds(days(3)));
        saveEvent(owner, application, "2번째", now.plusSeconds(days(2)));
        saveEvent(owner, application, "4번째", now.plusSeconds(days(4)));
        saveEvent(owner, application, "6번째", now.plusSeconds(days(6)));

        mockMvc.perform(get("/api/dashboard/summary").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.upcomingEvents.length()").value(5))
                .andExpect(jsonPath("$.upcomingEvents[0].title").value("1번째"))
                .andExpect(jsonPath("$.upcomingEvents[1].title").value("2번째"))
                .andExpect(jsonPath("$.upcomingEvents[2].title").value("3번째"))
                .andExpect(jsonPath("$.upcomingEvents[3].title").value("4번째"))
                .andExpect(jsonPath("$.upcomingEvents[4].title").value("5번째"))
                .andExpect(jsonPath("$.upcomingEvents[0].companyName").value("KB국민은행"))
                .andExpect(jsonPath("$.upcomingEvents[0].positionName").value("IT 개발"));
    }

    @Test
    void countsUpcomingEventsWithinFourteenDaysOnly() throws Exception {
        Application application = saveApplication(owner, "KB국민은행", "IT 개발", now.plusSeconds(days(2)), ApplicationStatus.WRITING);
        saveEvent(owner, application, "14일 이내", now.plusSeconds(days(14)));
        saveEvent(owner, application, "14일 이후", now.plusSeconds(days(15)));

        mockMvc.perform(get("/api/dashboard/summary").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.upcomingEventCount").value(1));
    }

    private Application saveApplication(
            User user,
            String companyName,
            String positionName,
            Instant deadlineAt,
            ApplicationStatus status
    ) {
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
                deadlineAt,
                status,
                null,
                null,
                null
        ));
    }

    private RecruitmentEvent saveEvent(User user, Application application, String title, Instant startAt) {
        return eventRepository.save(RecruitmentEvent.create(
                user,
                application,
                EventType.CODING_TEST,
                title,
                startAt,
                startAt.plusSeconds(3600),
                false,
                "온라인",
                null,
                null
        ));
    }

    private long days(int days) {
        return days * 24L * 60L * 60L;
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
