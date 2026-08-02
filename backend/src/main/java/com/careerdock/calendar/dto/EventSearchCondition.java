package com.careerdock.calendar.dto;

import com.careerdock.calendar.domain.EventType;
import java.time.Instant;

/**
 * 월간 범위 조회와 다가오는 일정 조회를 한 조건으로 표현한다.
 *
 * upcoming이면 start를 지금으로 대체하고 limit만큼만 돌려준다.
 */
public record EventSearchCondition(
        Instant start,
        Instant end,
        boolean upcoming,
        Integer limit,
        Long applicationId,
        EventType eventType
) {
}
