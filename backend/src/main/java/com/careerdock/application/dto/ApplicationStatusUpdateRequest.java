package com.careerdock.application.dto;

import com.careerdock.application.domain.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationStatusUpdateRequest(
        @NotNull(message = "지원 상태는 필수입니다.")
        ApplicationStatus status
) {
}
