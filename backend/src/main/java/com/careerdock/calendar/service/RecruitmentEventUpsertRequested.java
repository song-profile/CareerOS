package com.careerdock.calendar.service;

/** 커밋 이후 Google Calendar에 upsert를 밀어달라는 요청. {@link GoogleCalendarSyncService}가 소비한다. */
public record RecruitmentEventUpsertRequested(Long eventId) {
}
