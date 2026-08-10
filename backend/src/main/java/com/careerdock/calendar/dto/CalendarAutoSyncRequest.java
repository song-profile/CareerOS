package com.careerdock.calendar.dto;

import jakarta.validation.constraints.NotNull;

public record CalendarAutoSyncRequest(
        @NotNull(message = "자동 동기화 여부는 필수입니다.")
        Boolean enabled
) {
}
