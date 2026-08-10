package com.careerdock.dashboard.dto;

import java.util.List;

public record DashboardSummaryResponse(
        DashboardCountsResponse summary,
        List<DashboardDeadlineResponse> upcomingDeadlines,
        List<DashboardEventResponse> upcomingEvents,
        List<DashboardEventResponse> todayEvents,
        List<DashboardEventResponse> weekEvents,
        DashboardGoogleCalendarResponse googleCalendar,
        List<DashboardPreparationResponse> preparationItems,
        List<DashboardNotificationResponse> importantNotifications
) {
}
