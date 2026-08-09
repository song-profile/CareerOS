package com.careerdock.dashboard.service;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.calendar.repository.RecruitmentEventRepository;
import com.careerdock.dashboard.dto.DashboardCountsResponse;
import com.careerdock.dashboard.dto.DashboardDeadlineResponse;
import com.careerdock.dashboard.dto.DashboardEventResponse;
import com.careerdock.dashboard.dto.DashboardSummaryResponse;
import com.careerdock.global.util.TimeZoneConstants;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private static final int UPCOMING_DEADLINE_LIMIT = 3;
    private static final int UPCOMING_EVENT_LIMIT = 5;
    private static final Duration WEEKLY_DEADLINE_WINDOW = Duration.ofDays(7);
    private static final Duration UPCOMING_EVENT_COUNT_WINDOW = Duration.ofDays(14);
    private static final List<ApplicationStatus> FINISHED_STATUSES = List.of(
            ApplicationStatus.FINAL_ACCEPTED,
            ApplicationStatus.FINAL_REJECTED
    );

    private final ApplicationRepository applicationRepository;
    private final RecruitmentEventRepository eventRepository;

    public DashboardService(ApplicationRepository applicationRepository, RecruitmentEventRepository eventRepository) {
        this.applicationRepository = applicationRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(Long userId) {
        Instant now = Instant.now();
        Instant weeklyDeadlineEnd = now.plus(WEEKLY_DEADLINE_WINDOW);
        Instant eventCountEnd = now.plus(UPCOMING_EVENT_COUNT_WINDOW);

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

        return new DashboardSummaryResponse(
                new DashboardCountsResponse(weeklyDeadlineCount, upcomingEventCount, draftingApplicationCount),
                upcomingDeadlines,
                upcomingEvents
        );
    }

    private long daysUntil(Application application, Instant now) {
        LocalDate today = now.atZone(TimeZoneConstants.DISPLAY_ZONE_KOREA).toLocalDate();
        LocalDate deadlineDate = application.getDeadlineAt()
                .atZone(TimeZoneConstants.DISPLAY_ZONE_KOREA)
                .toLocalDate();
        return Duration.between(today.atStartOfDay(), deadlineDate.atStartOfDay()).toDays();
    }
}
