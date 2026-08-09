package com.careerdock.dashboard.controller;

import com.careerdock.dashboard.dto.DashboardSummaryResponse;
import com.careerdock.dashboard.service.DashboardService;
import com.careerdock.global.auth.CurrentUserAccessor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserAccessor currentUserAccessor;

    public DashboardController(DashboardService dashboardService, CurrentUserAccessor currentUserAccessor) {
        this.dashboardService = dashboardService;
        this.currentUserAccessor = currentUserAccessor;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary() {
        return dashboardService.getSummary(currentUserAccessor.getCurrentUserId());
    }
}
