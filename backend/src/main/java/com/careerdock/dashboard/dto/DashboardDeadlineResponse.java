package com.careerdock.dashboard.dto;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import java.time.Instant;

public record DashboardDeadlineResponse(
        Long applicationId,
        String companyName,
        String positionName,
        Instant deadlineAt,
        ApplicationStatus status,
        long daysUntil
) {
    public static DashboardDeadlineResponse from(Application application, long daysUntil) {
        return new DashboardDeadlineResponse(
                application.getId(),
                application.getCompany().getName(),
                application.getPositionName(),
                application.getDeadlineAt(),
                application.getStatus(),
                daysUntil
        );
    }
}
