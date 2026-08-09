package com.careerdock.dashboard.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.RecruitmentSeason;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.calendar.domain.EventType;
import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.calendar.repository.RecruitmentEventRepository;
import com.careerdock.company.domain.Company;
import com.careerdock.company.repository.CompanyRepository;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
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
                .andExpect(jsonPath("$.upcomingEvents.length()").value(0));
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
                .andExpect(jsonPath("$.upcomingEvents.length()").value(0));
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
