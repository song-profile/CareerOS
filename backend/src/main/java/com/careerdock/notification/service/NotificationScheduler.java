package com.careerdock.notification.service;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.calendar.domain.EventType;
import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.calendar.repository.RecruitmentEventRepository;
import com.careerdock.credential.domain.Credential;
import com.careerdock.credential.repository.CredentialRepository;
import com.careerdock.global.util.TimeZoneConstants;
import com.careerdock.notification.domain.NotificationType;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NotificationScheduler {

    private static final List<Integer> REMINDER_DAYS = List.of(7, 3, 1, 0);
    private static final List<ApplicationStatus> FINISHED_APPLICATION_STATUSES = List.of(
            ApplicationStatus.FINAL_ACCEPTED,
            ApplicationStatus.FINAL_REJECTED
    );

    private final ApplicationRepository applicationRepository;
    private final RecruitmentEventRepository eventRepository;
    private final CredentialRepository credentialRepository;
    private final NotificationService notificationService;
    private final Clock clock;

    public NotificationScheduler(
            ApplicationRepository applicationRepository,
            RecruitmentEventRepository eventRepository,
            CredentialRepository credentialRepository,
            NotificationService notificationService,
            Clock clock
    ) {
        this.applicationRepository = applicationRepository;
        this.eventRepository = eventRepository;
        this.credentialRepository = credentialRepository;
        this.notificationService = notificationService;
        this.clock = clock;
    }

    /** 매일 오전 9시(Asia/Seoul) 기준으로 D-7/D-3/D-1/D-day 알림을 생성한다. */
    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    public void createDailyReminderNotifications() {
        runFor(LocalDate.now(clock.withZone(TimeZoneConstants.DISPLAY_ZONE_KOREA)));
    }

    public void runFor(LocalDate today) {
        for (int daysBefore : REMINDER_DAYS) {
            LocalDate targetDate = today.plusDays(daysBefore);
            Instant from = targetDate.atStartOfDay(TimeZoneConstants.DISPLAY_ZONE_KOREA).toInstant();
            Instant to = targetDate.plusDays(1).atStartOfDay(TimeZoneConstants.DISPLAY_ZONE_KOREA).toInstant();

            createApplicationDeadlineNotifications(daysBefore, targetDate, from, to);
            createCalendarEventNotifications(daysBefore, targetDate, from, to);
        }

        createCredentialExpirationNotifications(today);
    }

    private void createApplicationDeadlineNotifications(int daysBefore, LocalDate targetDate, Instant from, Instant to) {
        for (Application application : applicationRepository.findNotificationDeadlineTargets(
                from,
                to,
                FINISHED_APPLICATION_STATUSES
        )) {
            String companyName = application.getCompany().getName();
            String dDay = dDayLabel(daysBefore);
            notificationService.createIfAbsent(
                    application.getUser().getId(),
                    NotificationType.APPLICATION_DEADLINE,
                    "지원 마감 " + dDay,
                    "%s %s 지원 마감이 %s입니다.".formatted(companyName, application.getPositionName(), dDay),
                    "/applications/" + application.getId(),
                    "APPLICATION",
                    application.getId(),
                    "APPLICATION_DEADLINE:%d:%s".formatted(application.getId(), targetDate)
            );
        }
    }

    private void createCalendarEventNotifications(int daysBefore, LocalDate targetDate, Instant from, Instant to) {
        for (RecruitmentEvent event : eventRepository.findNotificationStartTargets(from, to)) {
            NotificationType notificationType = notificationTypeFor(event.getEventType());
            String dDay = dDayLabel(daysBefore);
            notificationService.createIfAbsent(
                    event.getUser().getId(),
                    notificationType,
                    eventTypeTitle(event.getEventType()) + " " + dDay,
                    "%s 일정이 %s입니다.".formatted(event.getTitle(), dDay),
                    "/calendar/" + event.getId(),
                    "CALENDAR_EVENT",
                    event.getId(),
                    "CALENDAR_EVENT:%d:%d:%s".formatted(event.getId(), daysBefore, targetDate)
            );
        }
    }

    private void createCredentialExpirationNotifications(LocalDate today) {
        List<LocalDate> targetDates = REMINDER_DAYS.stream()
                .map(today::plusDays)
                .toList();

        for (Credential credential : credentialRepository.findNotificationExpirationTargets(targetDates)) {
            int daysBefore = (int) (credential.getExpiresAt().toEpochDay() - today.toEpochDay());
            String dDay = dDayLabel(daysBefore);
            notificationService.createIfAbsent(
                    credential.getUser().getId(),
                    NotificationType.CREDENTIAL_EXPIRATION,
                    "자격증 만료 " + dDay,
                    "%s 만료일이 %s입니다.".formatted(credential.getName(), dDay),
                    "/materials/credentials/" + credential.getId(),
                    "CREDENTIAL",
                    credential.getId(),
                    "CREDENTIAL_EXPIRATION:%d:%s".formatted(credential.getId(), credential.getExpiresAt())
            );
        }
    }

    private NotificationType notificationTypeFor(EventType eventType) {
        return switch (eventType) {
            case CODING_TEST -> NotificationType.CODING_TEST;
            case FIRST_INTERVIEW, SECOND_INTERVIEW, FINAL_INTERVIEW -> NotificationType.INTERVIEW;
            default -> NotificationType.CALENDAR_EVENT;
        };
    }

    private String eventTypeTitle(EventType eventType) {
        return switch (eventType) {
            case CODING_TEST -> "코딩테스트";
            case FIRST_INTERVIEW, SECOND_INTERVIEW, FINAL_INTERVIEW -> "면접";
            default -> "일정";
        };
    }

    private String dDayLabel(int daysBefore) {
        return daysBefore == 0 ? "오늘" : "D-" + daysBefore;
    }
}
