package com.careerdock.calendar.service;

/**
 * Google 쪽에서 캘린더 또는 이벤트가 404로 응답한 경우의 내부 신호.
 *
 * API 응답으로 그대로 나가면 안 된다 — {@link GoogleCalendarSyncService}가 항상 잡아서
 * 캘린더 재생성이나 이벤트 연결 해제 같은 자체 복구 로직으로 처리한다.
 */
class GoogleResourceNotFoundException extends RuntimeException {
}
