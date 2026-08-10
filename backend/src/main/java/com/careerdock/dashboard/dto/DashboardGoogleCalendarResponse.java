package com.careerdock.dashboard.dto;

public record DashboardGoogleCalendarResponse(
        boolean connected,
        boolean autoSyncEnabled,
        long syncedCount,
        long pendingCount,
        long failedCount
) {
    public static DashboardGoogleCalendarResponse notConnected() {
        return new DashboardGoogleCalendarResponse(false, false, 0, 0, 0);
    }
}
