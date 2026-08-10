package com.careerdock.dashboard.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.RecruitmentSeason;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.calendar.domain.EventType;
import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.calendar.repository.RecruitmentEventRepository;
import com.careerdock.company.domain.Company;
import com.careerdock.company.repository.CompanyRepository;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import jakarta.persistence.EntityManagerFactory;
import java.time.Instant;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

/**
 * 대시보드 요약이 지원 건·일정 개수가 늘어도 고정된 쿼리 수로 응답하는지(N+1 없음) 검증한다.
 * company/application 연관은 @EntityGraph로 함께 조회되므로, 건수가 늘어도 쿼리 수는 그대로여야 한다.
 */
@SpringBootTest(properties = "spring.jpa.properties.hibernate.generate_statistics=true")
@ActiveProfiles("test")
class DashboardServiceQueryCountTest {

    @Autowired private DashboardService dashboardService;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private RecruitmentEventRepository eventRepository;
    @Autowired private EntityManagerFactory entityManagerFactory;

    private Statistics statistics;
    private Instant now;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");
        statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.setStatisticsEnabled(true);
        now = Instant.now();
    }

    @Test
    void summaryQueryCountStaysFixedAsDataGrows() {
        User smallUser = userRepository.save(User.createGoogleUser("dash-small", "small@example.com", "적음", null));
        seedApplicationsAndEvents(smallUser, 2);

        statistics.clear();
        dashboardService.getSummary(smallUser.getId());
        long queryCountForFewRows = statistics.getPrepareStatementCount();

        User largeUser = userRepository.save(User.createGoogleUser("dash-large", "large@example.com", "많음", null));
        seedApplicationsAndEvents(largeUser, 20);

        statistics.clear();
        dashboardService.getSummary(largeUser.getId());
        long queryCountForManyRows = statistics.getPrepareStatementCount();

        assertThat(queryCountForManyRows)
                .as("company/application을 회사당 1건씩 추가로 조회하는 N+1이 생기면 이 값이 rows에 비례해 늘어난다")
                .isEqualTo(queryCountForFewRows);
    }

    private void seedApplicationsAndEvents(User user, int count) {
        for (int i = 0; i < count; i++) {
            Company company = companyRepository.save(Company.create(user, "회사" + i, null, null));
            Application application = applicationRepository.save(Application.create(
                    user,
                    company,
                    "직무" + i,
                    "2026 하반기",
                    2026,
                    RecruitmentSeason.SECOND_HALF,
                    null,
                    null,
                    now.plusSeconds((i + 1) * 3600L),
                    ApplicationStatus.WRITING,
                    null,
                    null,
                    null
            ));
            eventRepository.save(RecruitmentEvent.create(
                    user,
                    application,
                    EventType.CODING_TEST,
                    "일정" + i,
                    now.plusSeconds((i + 1) * 3600L),
                    now.plusSeconds((i + 1) * 3600L + 1800),
                    false,
                    null,
                    null,
                    null
            ));
        }
    }
}
