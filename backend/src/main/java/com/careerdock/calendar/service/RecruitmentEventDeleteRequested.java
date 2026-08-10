package com.careerdock.calendar.service;

/**
 * 커밋 이후 Google Calendar에서 이벤트 삭제를 밀어달라는 요청. {@link GoogleCalendarSyncService}가
 * 소비한다. 로컬 행은 발행 시점 이후 곧바로 삭제되므로, 리스너가 다시 조회할 수 없는 값은
 * 여기에 그대로 담아 보낸다.
 */
public record RecruitmentEventDeleteRequested(Long eventId, Long userId, String googleEventId) {
}
