package com.careerdock.dashboard.dto;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import java.time.Instant;

public record DashboardPreparationResponse(
        Long applicationId,
        String companyName,
        String positionName,
        ApplicationStatus status,
        Instant deadlineAt,
        Long daysUntil,
        long essayQuestionCount,
        long essayAnswerCount,
        long materialCount,
        long eventCount
) {
    public static DashboardPreparationResponse from(
            Application application,
            Long daysUntil,
            long essayQuestionCount,
            long essayAnswerCount,
            long materialCount,
            long eventCount
    ) {
        return new DashboardPreparationResponse(
                application.getId(),
                application.getCompany().getName(),
                application.getPositionName(),
                application.getStatus(),
                application.getDeadlineAt(),
                daysUntil,
                essayQuestionCount,
                essayAnswerCount,
                materialCount,
                eventCount
        );
    }
}
