package com.careerdock.application.dto;

import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.ApplicationStatusHistory;
import java.time.Instant;

public record ApplicationStatusHistoryResponse(
        Long id,
        ApplicationStatus previousStatus,
        ApplicationStatus newStatus,
        Instant changedAt
) {
    public static ApplicationStatusHistoryResponse from(ApplicationStatusHistory history) {
        return new ApplicationStatusHistoryResponse(
                history.getId(),
                history.getPreviousStatus(),
                history.getNewStatus(),
                history.getChangedAt()
        );
    }
}
