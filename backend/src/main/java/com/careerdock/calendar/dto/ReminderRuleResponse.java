package com.careerdock.calendar.dto;

import com.careerdock.calendar.domain.ReminderChannel;
import com.careerdock.calendar.domain.ReminderRule;

public record ReminderRuleResponse(
        Long id,
        int minutesBefore,
        ReminderChannel channel,
        boolean enabled
) {
    public static ReminderRuleResponse from(ReminderRule rule) {
        return new ReminderRuleResponse(rule.getId(), rule.getMinutesBefore(), rule.getChannel(), rule.isEnabled());
    }
}
