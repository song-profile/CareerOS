package com.careerdock.calendar.domain;

/**
 * Google Calendar 동기화 상태. 연동은 MVP 2라 지금은 모든 일정이 NOT_CONNECTED로 남는다.
 * 상태 값을 미리 두는 이유는 연동을 붙일 때 마이그레이션 없이 전환하기 위해서다.
 */
public enum SyncStatus {
    NOT_CONNECTED,
    PENDING,
    SYNCED,
    FAILED
}
