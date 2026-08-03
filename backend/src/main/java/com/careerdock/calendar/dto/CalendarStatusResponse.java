package com.careerdock.calendar.dto;

import com.careerdock.calendar.domain.SyncStatus;
import java.time.Instant;
import java.util.Map;

/**
 * connected가 false면 아래 필드는 전부 null/빈 값이다 — {@code CalendarConnection} 행 자체가
 * 없다는 뜻이라 연결 상태 관련 정보가 있을 수 없다.
 */
public record CalendarStatusResponse(
        boolean connected,
        SyncStatus status,
        Instant connectedAt,
        Instant lastSyncedAt,
        String lastSyncError,
        Map<SyncStatus, Long> eventCounts
) {
    public static CalendarStatusResponse notConnected(Map<SyncStatus, Long> eventCounts) {
        return new CalendarStatusResponse(false, null, null, null, null, eventCounts);
    }
}
