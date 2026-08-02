package com.careerdock.calendar.dto;

import com.careerdock.calendar.domain.ReminderChannel;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * 알림 규칙 요청. channel이 비면 INTERNAL, enabled가 비면 켜진 상태로 본다.
 */
public record ReminderRuleRequest(
        @NotNull(message = "알림 시점은 필수입니다.")
        @PositiveOrZero(message = "알림 시점은 0분 이상이어야 합니다.")
        Integer minutesBefore,

        ReminderChannel channel,

        Boolean enabled
) {
    public ReminderChannel channelOrDefault() {
        return channel == null ? ReminderChannel.INTERNAL : channel;
    }

    public boolean enabledOrDefault() {
        return enabled == null || enabled;
    }
}
