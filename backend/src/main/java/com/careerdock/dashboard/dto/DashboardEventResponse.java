package com.careerdock.dashboard.dto;

import com.careerdock.application.domain.Application;
import com.careerdock.calendar.domain.EventType;
import com.careerdock.calendar.domain.RecruitmentEvent;
import java.time.Instant;

public record DashboardEventResponse(
        Long eventId,
        Long applicationId,
        String companyName,
        String positionName,
        EventType eventType,
        String title,
        Instant startAt,
        Instant endAt,
        boolean allDay,
        String location
) {
    public static DashboardEventResponse from(RecruitmentEvent event) {
        Application application = event.getApplication();
        return new DashboardEventResponse(
                event.getId(),
                application == null ? null : application.getId(),
                application == null ? null : application.getCompany().getName(),
                application == null ? null : application.getPositionName(),
                event.getEventType(),
                event.getTitle(),
                event.getStartAt(),
                event.getEndAt(),
                event.isAllDay(),
                event.getLocation()
        );
    }
}
