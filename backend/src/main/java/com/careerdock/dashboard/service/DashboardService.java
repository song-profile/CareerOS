package com.careerdock.dashboard.service;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.resource.repository.ApplicationCredentialRepository;
import com.careerdock.application.resource.repository.ApplicationExternalLinkRepository;
import com.careerdock.application.resource.repository.ApplicationFileRepository;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.calendar.domain.SyncStatus;
import com.careerdock.calendar.repository.CalendarConnectionRepository;
import com.careerdock.calendar.repository.RecruitmentEventRepository;
import com.careerdock.dashboard.dto.DashboardApplicationCountProjection;
import com.careerdock.dashboard.dto.DashboardCountsResponse;
import com.careerdock.dashboard.dto.DashboardDeadlineResponse;
import com.careerdock.dashboard.dto.DashboardEventResponse;
import com.careerdock.dashboard.dto.DashboardGoogleCalendarResponse;
import com.careerdock.dashboard.dto.DashboardNotificationResponse;
import com.careerdock.dashboard.dto.DashboardPreparationResponse;
import com.careerdock.dashboard.dto.DashboardSummaryResponse;
import com.careerdock.essay.repository.EssayAnswerRepository;
import com.careerdock.essay.repository.EssayQuestionRepository;
import com.careerdock.global.util.TimeZoneConstants;
import com.careerdock.notification.domain.Notification;
import com.careerdock.notification.domain.NotificationType;
import com.careerdock.notification.repository.NotificationRepository;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private static final int UPCOMING_DEADLINE_LIMIT = 3;
    private static final int UPCOMING_EVENT_LIMIT = 5;
    private static final int TODAY_EVENT_LIMIT = 6;
    private static final int WEEK_EVENT_LIMIT = 12;
    private static final int PREPARATION_LIMIT = 4;
    private static final int IMPORTANT_NOTIFICATION_LIMIT = 4;
    private static final int IMPORTANT_NOTIFICATION_CANDIDATE_LIMIT = IMPORTANT_NOTIFICATION_LIMIT * 4;
    private static final String APPLICATION_RESOURCE_TYPE = "APPLICATION";
    private static final String CALENDAR_EVENT_RESOURCE_TYPE = "CALENDAR_EVENT";
    private static final Duration WEEKLY_DEADLINE_WINDOW = Duration.ofDays(7);
    private static final Duration UPCOMING_EVENT_COUNT_WINDOW = Duration.ofDays(14);
    private static final List<ApplicationStatus> FINISHED_STATUSES = List.of(
            ApplicationStatus.FINAL_ACCEPTED,
            ApplicationStatus.FINAL_REJECTED
    );
    private static final List<NotificationType> IMPORTANT_NOTIFICATION_TYPES = List.of(
            NotificationType.APPLICATION_DEADLINE,
            NotificationType.INTERVIEW,
            NotificationType.CODING_TEST,
            NotificationType.CALENDAR_EVENT,
            NotificationType.SYSTEM
    );

    private final ApplicationRepository applicationRepository;
    private final RecruitmentEventRepository eventRepository;
    private final CalendarConnectionRepository connectionRepository;
    private final NotificationRepository notificationRepository;
    private final EssayQuestionRepository essayQuestionRepository;
    private final EssayAnswerRepository essayAnswerRepository;
    private final ApplicationFileRepository applicationFileRepository;
    private final ApplicationCredentialRepository applicationCredentialRepository;
    private final ApplicationExternalLinkRepository applicationExternalLinkRepository;

    public DashboardService(
            ApplicationRepository applicationRepository,
            RecruitmentEventRepository eventRepository,
            CalendarConnectionRepository connectionRepository,
            NotificationRepository notificationRepository,
            EssayQuestionRepository essayQuestionRepository,
            EssayAnswerRepository essayAnswerRepository,
            ApplicationFileRepository applicationFileRepository,
            ApplicationCredentialRepository applicationCredentialRepository,
            ApplicationExternalLinkRepository applicationExternalLinkRepository
    ) {
        this.applicationRepository = applicationRepository;
        this.eventRepository = eventRepository;
        this.connectionRepository = connectionRepository;
        this.notificationRepository = notificationRepository;
        this.essayQuestionRepository = essayQuestionRepository;
        this.essayAnswerRepository = essayAnswerRepository;
        this.applicationFileRepository = applicationFileRepository;
        this.applicationCredentialRepository = applicationCredentialRepository;
        this.applicationExternalLinkRepository = applicationExternalLinkRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(Long userId) {
        Instant now = Instant.now();
        Instant weeklyDeadlineEnd = now.plus(WEEKLY_DEADLINE_WINDOW);
        Instant eventCountEnd = now.plus(UPCOMING_EVENT_COUNT_WINDOW);
        ZonedDateTime todayStart = now.atZone(TimeZoneConstants.DISPLAY_ZONE_KOREA).toLocalDate()
                .atStartOfDay(TimeZoneConstants.DISPLAY_ZONE_KOREA);
        Instant todayStartInstant = todayStart.toInstant();
        Instant tomorrowStartInstant = todayStart.plusDays(1).toInstant();
        Instant weekEndInstant = todayStart.plusDays(7).toInstant();

        long weeklyDeadlineCount = applicationRepository.countDashboardDeadlinesBetween(
                userId,
                now,
                weeklyDeadlineEnd,
                FINISHED_STATUSES
        );
        long upcomingEventCount = eventRepository.countByUserIdAndStartAtGreaterThanAndStartAtLessThanEqual(
                userId,
                now,
                eventCountEnd
        );
        long draftingApplicationCount = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.WRITING);

        List<DashboardDeadlineResponse> upcomingDeadlines = applicationRepository.findDashboardUpcomingDeadlines(
                        userId,
                        now,
                        FINISHED_STATUSES,
                        PageRequest.of(0, UPCOMING_DEADLINE_LIMIT)
                )
                .stream()
                .map(application -> DashboardDeadlineResponse.from(application, daysUntil(application, now)))
                .toList();

        List<DashboardEventResponse> upcomingEvents = eventRepository.findDashboardUpcomingEvents(
                        userId,
                        now,
                        PageRequest.of(0, UPCOMING_EVENT_LIMIT)
                )
                .stream()
                .map(DashboardEventResponse::from)
                .toList();

        List<DashboardEventResponse> todayEvents = eventRepository.findDashboardEventsBetween(
                        userId,
                        todayStartInstant,
                        tomorrowStartInstant,
                        PageRequest.of(0, TODAY_EVENT_LIMIT)
                )
                .stream()
                .map(DashboardEventResponse::from)
                .toList();

        List<DashboardEventResponse> weekEvents = eventRepository.findDashboardEventsBetween(
                        userId,
                        todayStartInstant,
                        weekEndInstant,
                        PageRequest.of(0, WEEK_EVENT_LIMIT)
                )
                .stream()
                .map(DashboardEventResponse::from)
                .toList();

        DashboardGoogleCalendarResponse googleCalendar = getGoogleCalendarStatus(userId);
        List<DashboardPreparationResponse> preparationItems = getPreparationItems(userId, now);
        List<DashboardNotificationResponse> importantNotifications = getImportantNotifications(userId, now);

        return new DashboardSummaryResponse(
                new DashboardCountsResponse(weeklyDeadlineCount, upcomingEventCount, draftingApplicationCount),
                upcomingDeadlines,
                upcomingEvents,
                todayEvents,
                weekEvents,
                googleCalendar,
                preparationItems,
                importantNotifications
        );
    }

    private List<DashboardNotificationResponse> getImportantNotifications(Long userId, Instant now) {
        List<Notification> candidates = notificationRepository.findDashboardImportantNotifications(
                userId,
                IMPORTANT_NOTIFICATION_TYPES,
                PageRequest.of(0, IMPORTANT_NOTIFICATION_CANDIDATE_LIMIT)
        );

        Set<Long> activeApplicationIds = getActiveApplicationIds(userId, now, candidates);
        Set<Long> activeEventIds = getActiveEventIds(userId, now, candidates);

        return candidates.stream()
                .filter(notification -> isActiveDashboardNotification(notification, activeApplicationIds, activeEventIds))
                .limit(IMPORTANT_NOTIFICATION_LIMIT)
                .map(DashboardNotificationResponse::from)
                .toList();
    }

    private Set<Long> getActiveApplicationIds(Long userId, Instant now, List<Notification> notifications) {
        List<Long> applicationIds = notifications.stream()
                .filter(notification -> notification.getType() == NotificationType.APPLICATION_DEADLINE)
                .filter(notification -> APPLICATION_RESOURCE_TYPE.equals(notification.getRelatedResourceType()))
                .map(Notification::getRelatedResourceId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        if (applicationIds.isEmpty()) {
            return Set.of();
        }

        return new HashSet<>(applicationRepository.findActiveDashboardDeadlineApplicationIds(
                userId,
                applicationIds,
                now,
                FINISHED_STATUSES
        ));
    }

    private Set<Long> getActiveEventIds(Long userId, Instant now, List<Notification> notifications) {
        List<Long> eventIds = notifications.stream()
                .filter(notification -> isCalendarEventNotificationType(notification.getType()))
                .filter(notification -> CALENDAR_EVENT_RESOURCE_TYPE.equals(notification.getRelatedResourceType()))
                .map(Notification::getRelatedResourceId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        if (eventIds.isEmpty()) {
            return Set.of();
        }

        return new HashSet<>(eventRepository.findActiveDashboardEventIds(userId, eventIds, now));
    }

    private boolean isActiveDashboardNotification(
            Notification notification,
            Set<Long> activeApplicationIds,
            Set<Long> activeEventIds
    ) {
        if (notification.getType() == NotificationType.APPLICATION_DEADLINE
                && APPLICATION_RESOURCE_TYPE.equals(notification.getRelatedResourceType())) {
            return activeApplicationIds.contains(notification.getRelatedResourceId());
        }

        if (isCalendarEventNotificationType(notification.getType())
                && CALENDAR_EVENT_RESOURCE_TYPE.equals(notification.getRelatedResourceType())) {
            return activeEventIds.contains(notification.getRelatedResourceId());
        }

        return true;
    }

    private boolean isCalendarEventNotificationType(NotificationType type) {
        return type == NotificationType.INTERVIEW
                || type == NotificationType.CODING_TEST
                || type == NotificationType.CALENDAR_EVENT;
    }

    private DashboardGoogleCalendarResponse getGoogleCalendarStatus(Long userId) {
        return connectionRepository.findByUserId(userId)
                .map(connection -> {
                    Map<SyncStatus, Long> counts = new EnumMap<>(SyncStatus.class);
                    eventRepository.findSyncStatusesByUserId(userId)
                            .forEach(status -> counts.merge(status, 1L, Long::sum));
                    return new DashboardGoogleCalendarResponse(
                            true,
                            connection.isAutoSyncEnabled(),
                            counts.getOrDefault(SyncStatus.SYNCED, 0L),
                            counts.getOrDefault(SyncStatus.PENDING, 0L),
                            counts.getOrDefault(SyncStatus.FAILED, 0L)
                    );
                })
                .orElseGet(DashboardGoogleCalendarResponse::notConnected);
    }

    private List<DashboardPreparationResponse> getPreparationItems(Long userId, Instant now) {
        List<Application> applications = applicationRepository.findDashboardPreparationApplications(
                userId,
                FINISHED_STATUSES,
                PageRequest.of(0, PREPARATION_LIMIT)
        );

        if (applications.isEmpty()) {
            return List.of();
        }

        List<Long> applicationIds = applications.stream().map(Application::getId).toList();
        Map<Long, Long> questionCounts = toCountMap(
                essayQuestionRepository.countDashboardQuestionsByApplicationIds(userId, applicationIds)
        );
        Map<Long, Long> answerCounts = toCountMap(
                essayAnswerRepository.countDashboardAnsweredQuestionsByApplicationIds(userId, applicationIds)
        );
        Map<Long, Long> materialCounts = mergeCounts(
                toCountMap(applicationFileRepository.countDashboardFilesByApplicationIds(userId, applicationIds)),
                toCountMap(applicationCredentialRepository.countDashboardCredentialsByApplicationIds(userId, applicationIds)),
                toCountMap(applicationExternalLinkRepository.countDashboardExternalLinksByApplicationIds(userId, applicationIds))
        );
        Map<Long, Long> eventCounts = toCountMap(
                eventRepository.countDashboardEventsByApplicationIds(userId, applicationIds)
        );

        return applications.stream()
                .map(application -> DashboardPreparationResponse.from(
                        application,
                        application.getDeadlineAt() == null ? null : daysUntil(application, now),
                        questionCounts.getOrDefault(application.getId(), 0L),
                        answerCounts.getOrDefault(application.getId(), 0L),
                        materialCounts.getOrDefault(application.getId(), 0L),
                        eventCounts.getOrDefault(application.getId(), 0L)
                ))
                .toList();
    }

    private Map<Long, Long> toCountMap(List<DashboardApplicationCountProjection> counts) {
        return counts.stream()
                .collect(Collectors.toMap(
                        DashboardApplicationCountProjection::getApplicationId,
                        DashboardApplicationCountProjection::getCount
                ));
    }

    @SafeVarargs
    private Map<Long, Long> mergeCounts(Map<Long, Long>... countMaps) {
        Map<Long, Long> merged = new java.util.HashMap<>();
        for (Map<Long, Long> countMap : countMaps) {
            countMap.forEach((applicationId, count) -> merged.merge(applicationId, count, Long::sum));
        }
        return merged;
    }

    private long daysUntil(Application application, Instant now) {
        LocalDate today = now.atZone(TimeZoneConstants.DISPLAY_ZONE_KOREA).toLocalDate();
        LocalDate deadlineDate = application.getDeadlineAt()
                .atZone(TimeZoneConstants.DISPLAY_ZONE_KOREA)
                .toLocalDate();
        return Duration.between(today.atStartOfDay(), deadlineDate.atStartOfDay()).toDays();
    }
}
