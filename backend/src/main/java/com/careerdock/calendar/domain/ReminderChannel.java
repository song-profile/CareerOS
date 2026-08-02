package com.careerdock.calendar.domain;

/**
 * 알림 전달 경로. 프론트의 ReminderChannel과 값이 같다.
 *
 * 실제 발송은 이번 단계 범위 밖이며 규칙만 저장한다. 그래도 채널을 값으로 남겨 두는 이유는
 * 알림 중복 방지 기준이 (일정, 시점, 채널)이기 때문이다. 같은 시점이라도 채널이 다르면 다른 규칙이다.
 */
public enum ReminderChannel {
    INTERNAL,
    GOOGLE_CALENDAR,
    EMAIL
}
