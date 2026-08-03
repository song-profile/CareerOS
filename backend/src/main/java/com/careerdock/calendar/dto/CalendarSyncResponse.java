package com.careerdock.calendar.dto;

/** POST /api/calendar/sync 결과 요약. attempted = synced + failed. */
public record CalendarSyncResponse(int attempted, int synced, int failed) {
}
