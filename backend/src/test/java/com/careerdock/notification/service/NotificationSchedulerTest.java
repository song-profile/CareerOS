package com.careerdock.notification.service;

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
import com.careerdock.credential.domain.Credential;
import com.careerdock.credential.domain.CredentialType;
import com.careerdock.credential.repository.CredentialRepository;
import com.careerdock.global.util.TimeZoneConstants;
import com.careerdock.notification.domain.NotificationType;
import com.careerdock.notification.repository.NotificationRepository;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class NotificationSchedulerTest {

    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private RecruitmentEventRepository eventRepository;
    @Autowired private CredentialRepository credentialRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private NotificationScheduler scheduler;

    private User owner;
    private User otherUser;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");

        owner = userRepository.save(User.createGoogleUser("scheduler-owner", "owner@example.com", "본인", null));
        otherUser = userRepository.save(User.createGoogleUser("scheduler-other", "other@example.com", "타인", null));
        today = LocalDate.of(2026, 8, 8);
    }

    @Test
    void createsApplicationDeadlineNotificationsAndPreventsDuplicates() {
        saveApplication(owner, "KB국민은행", "IT 개발", atKoreaStart(today.plusDays(7)), ApplicationStatus.WRITING);
        saveApplication(owner, "과거", "데이터", atKoreaStart(today.minusDays(1)), ApplicationStatus.WRITING);
        saveApplication(owner, "종료", "보안", atKoreaStart(today.plusDays(3)), ApplicationStatus.FINAL_REJECTED);
        saveApplication(otherUser, "타인", "백엔드", atKoreaStart(today.plusDays(7)), ApplicationStatus.WRITING);

        scheduler.runFor(today);
        scheduler.runFor(today);

        assertThat(notificationRepository.count()).isEqualTo(2);
        assertThat(notificationRepository.findByUser(owner.getId(), false, org.springframework.data.domain.PageRequest.of(0, 10)))
                .hasSize(1)
                .first()
                .satisfies(notification -> {
                    assertThat(notification.getType()).isEqualTo(NotificationType.APPLICATION_DEADLINE);
                    assertThat(notification.getTitle()).isEqualTo("지원 마감 D-7");
                    assertThat(notification.getLinkUrl()).startsWith("/applications/");
                });
    }

    @Test
    void createsApplicationDeadlineNotificationsForEveryReminderDayAndPreventsDuplicatesOnRerun() {
        saveApplication(owner, "D7", "개발", atKoreaStart(today.plusDays(7)), ApplicationStatus.WRITING);
        saveApplication(owner, "D3", "개발", atKoreaStart(today.plusDays(3)), ApplicationStatus.WRITING);
        saveApplication(owner, "D1", "개발", atKoreaStart(today.plusDays(1)), ApplicationStatus.WRITING);
        saveApplication(owner, "D0", "개발", atKoreaStart(today), ApplicationStatus.WRITING);

        scheduler.runFor(today);
        scheduler.runFor(today);

        assertThat(notificationRepository.count()).isEqualTo(4);
        assertThat(notificationRepository.findByUser(owner.getId(), false, org.springframework.data.domain.PageRequest.of(0, 10)))
                .extracting("title")
                .containsExactlyInAnyOrder("지원 마감 D-7", "지원 마감 D-3", "지원 마감 D-1", "지원 마감 오늘");
    }

    @Test
    void createsCalendarEventNotificationsByEventType() {
        Application application = saveApplication(owner, "KB국민은행", "IT 개발", null, ApplicationStatus.WRITING);
        eventRepository.save(RecruitmentEvent.create(
                owner,
                application,
                EventType.CODING_TEST,
                "코딩테스트",
                atKoreaStart(today.plusDays(3)),
                atKoreaStart(today.plusDays(3)).plusSeconds(3600),
                false,
                null,
                null,
                null
        ));
        eventRepository.save(RecruitmentEvent.create(
                owner,
                application,
                EventType.FIRST_INTERVIEW,
                "1차 면접",
                atKoreaStart(today.plusDays(1)),
                atKoreaStart(today.plusDays(1)).plusSeconds(3600),
                false,
                null,
                null,
                null
        ));

        scheduler.runFor(today);

        assertThat(notificationRepository.findByUser(owner.getId(), false, org.springframework.data.domain.PageRequest.of(0, 10)))
                .extracting("type")
                .contains(NotificationType.CODING_TEST, NotificationType.INTERVIEW);
    }

    @Test
    void createsCalendarEventNotificationsForEveryReminderDayAndPreventsDuplicatesOnRerun() {
        Application application = saveApplication(owner, "KB국민은행", "IT 개발", null, ApplicationStatus.WRITING);
        saveEvent(application, "D7 일정", today.plusDays(7));
        saveEvent(application, "D3 일정", today.plusDays(3));
        saveEvent(application, "D1 일정", today.plusDays(1));
        saveEvent(application, "D0 일정", today);

        scheduler.runFor(today);
        scheduler.runFor(today);

        assertThat(notificationRepository.count()).isEqualTo(4);
        assertThat(notificationRepository.findByUser(owner.getId(), false, org.springframework.data.domain.PageRequest.of(0, 10)))
                .extracting("message")
                .containsExactlyInAnyOrder(
                        "D7 일정 일정이 D-7입니다.",
                        "D3 일정 일정이 D-3입니다.",
                        "D1 일정 일정이 D-1입니다.",
                        "D0 일정 일정이 오늘입니다."
                );
    }

    private RecruitmentEvent saveEvent(Application application, String title, LocalDate startDate) {
        Instant startAt = atKoreaStart(startDate);
        return eventRepository.save(RecruitmentEvent.create(
                owner,
                application,
                EventType.PERSONAL_PREPARATION,
                title,
                startAt,
                startAt.plusSeconds(3600),
                false,
                null,
                null,
                null
        ));
    }

    @Test
    void createsCredentialExpirationNotificationsAndSkipsPermanentCredentials() {
        credentialRepository.save(Credential.create(
                owner,
                CredentialType.CERTIFICATION,
                "SQLD",
                "한국데이터산업진흥원",
                today.minusYears(1),
                "encrypted",
                null,
                null,
                null,
                today.plusDays(1),
                false,
                null,
                null,
                null,
                null
        ));
        credentialRepository.save(Credential.create(
                owner,
                CredentialType.CERTIFICATION,
                "영구 자격",
                "기관",
                today.minusYears(1),
                "encrypted",
                null,
                null,
                null,
                null,
                true,
                null,
                null,
                null,
                null
        ));

        scheduler.runFor(today);

        assertThat(notificationRepository.findByUser(owner.getId(), false, org.springframework.data.domain.PageRequest.of(0, 10)))
                .hasSize(1)
                .first()
                .satisfies(notification -> {
                    assertThat(notification.getType()).isEqualTo(NotificationType.CREDENTIAL_EXPIRATION);
                    assertThat(notification.getTitle()).isEqualTo("자격증 만료 D-1");
                    assertThat(notification.getLinkUrl()).startsWith("/materials/credentials/");
                });
    }

    @Test
    void createsCredentialExpirationNotificationsForEveryReminderDayAndPreventsDuplicatesOnRerun() {
        saveCredential("D7", today.plusDays(7));
        saveCredential("D3", today.plusDays(3));
        saveCredential("D1", today.plusDays(1));
        saveCredential("D0", today);

        scheduler.runFor(today);
        scheduler.runFor(today);

        assertThat(notificationRepository.count()).isEqualTo(4);
        assertThat(notificationRepository.findByUser(owner.getId(), false, org.springframework.data.domain.PageRequest.of(0, 10)))
                .extracting("title")
                .containsExactlyInAnyOrder(
                        "자격증 만료 D-7", "자격증 만료 D-3", "자격증 만료 D-1", "자격증 만료 오늘");
    }

    private Credential saveCredential(String name, LocalDate expiresAt) {
        return credentialRepository.save(Credential.create(
                owner,
                CredentialType.CERTIFICATION,
                name,
                "기관",
                today.minusYears(1),
                "encrypted",
                null,
                null,
                null,
                expiresAt,
                false,
                null,
                null,
                null,
                null
        ));
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

    private Instant atKoreaStart(LocalDate date) {
        return date.atStartOfDay(TimeZoneConstants.DISPLAY_ZONE_KOREA).toInstant();
    }
}
