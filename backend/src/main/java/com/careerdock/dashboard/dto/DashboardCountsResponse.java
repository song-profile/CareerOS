package com.careerdock.dashboard.dto;

public record DashboardCountsResponse(
        long weeklyDeadlineCount,
        long upcomingEventCount,
        long draftingApplicationCount
) {
}
