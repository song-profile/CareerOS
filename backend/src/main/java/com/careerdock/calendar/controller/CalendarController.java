package com.careerdock.calendar.controller;

import com.careerdock.calendar.domain.EventType;
import com.careerdock.calendar.dto.EventSearchCondition;
import com.careerdock.calendar.dto.RecruitmentEventRequest;
import com.careerdock.calendar.dto.RecruitmentEventResponse;
import com.careerdock.calendar.service.CalendarService;
import com.careerdock.global.auth.CurrentUserAccessor;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calendar/events")
public class CalendarController {

    private final CalendarService calendarService;
    private final CurrentUserAccessor currentUserAccessor;

    public CalendarController(CalendarService calendarService, CurrentUserAccessor currentUserAccessor) {
        this.calendarService = calendarService;
        this.currentUserAccessor = currentUserAccessor;
    }

    /** 월간 조회는 start·end, 다가오는 일정은 upcoming·limit을 쓴다. 둘 다 같은 조건으로 처리한다. */
    @GetMapping
    public List<RecruitmentEventResponse> findAll(
            @RequestParam(required = false) Instant start,
            @RequestParam(required = false) Instant end,
            @RequestParam(required = false, defaultValue = "false") boolean upcoming,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Long applicationId,
            @RequestParam(required = false) EventType eventType
    ) {
        EventSearchCondition condition =
                new EventSearchCondition(start, end, upcoming, limit, applicationId, eventType);
        return calendarService.findAll(currentUserAccessor.getCurrentUserId(), condition);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecruitmentEventResponse create(@Valid @RequestBody RecruitmentEventRequest request) {
        return calendarService.create(currentUserAccessor.getCurrentUserId(), request);
    }

    @GetMapping("/{id}")
    public RecruitmentEventResponse findOne(@PathVariable Long id) {
        return calendarService.findOne(currentUserAccessor.getCurrentUserId(), id);
    }

    @PatchMapping("/{id}")
    public RecruitmentEventResponse update(
            @PathVariable Long id,
            @Valid @RequestBody RecruitmentEventRequest request
    ) {
        return calendarService.update(currentUserAccessor.getCurrentUserId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        calendarService.delete(currentUserAccessor.getCurrentUserId(), id);
    }
}
