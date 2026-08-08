package com.careerdock.calendar.controller;

import com.careerdock.calendar.dto.CalendarConnectResponse;
import com.careerdock.calendar.dto.CalendarStatusResponse;
import com.careerdock.calendar.dto.CalendarSyncResponse;
import com.careerdock.calendar.dto.TestEventResponse;
import com.careerdock.calendar.service.GoogleCalendarSyncService;
import com.careerdock.global.auth.CurrentUserAccessor;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Google Calendar 연결/동기화. 일정 자체의 CRUD는 {@link CalendarController}
 * (/api/calendar/events/**)가 맡고, 이 컨트롤러는 Google 쪽 연결과 동기화만 다룬다.
 *
 * 로그인용 Google OAuth와 완전히 분리된 흐름이라 {@code /oauth2/**}(Spring Security 관리)가
 * 아닌 {@code /api/calendar/oauth/callback}을 직접 쓴다 — 이미 인증된 세션에서만 도착하므로
 * SecurityConfig의 별도 예외 규칙이 필요 없다.
 */
@RestController
@RequestMapping("/api/calendar")
public class GoogleCalendarController {

    private final GoogleCalendarSyncService syncService;
    private final CurrentUserAccessor currentUserAccessor;

    public GoogleCalendarController(GoogleCalendarSyncService syncService, CurrentUserAccessor currentUserAccessor) {
        this.syncService = syncService;
        this.currentUserAccessor = currentUserAccessor;
    }

    @PostMapping("/connect")
    public CalendarConnectResponse connect(HttpSession session) {
        return syncService.startConnect(session);
    }

    @GetMapping("/oauth/callback")
    public void callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpSession session,
            HttpServletResponse response
    ) throws IOException {
        syncService.handleCallback(currentUserAccessor.getCurrentUserId(), session, code, state, error, response);
    }

    @GetMapping("/status")
    public CalendarStatusResponse status() {
        return syncService.status(currentUserAccessor.getCurrentUserId());
    }

    @PostMapping("/sync")
    public CalendarSyncResponse sync() {
        return syncService.retrySync(currentUserAccessor.getCurrentUserId());
    }

    @DeleteMapping("/disconnect")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disconnect() {
        syncService.disconnect(currentUserAccessor.getCurrentUserId());
    }

    @PostMapping("/test-event")
    public TestEventResponse testEvent() {
        return syncService.testEvent(currentUserAccessor.getCurrentUserId());
    }
}
