package com.careerdock.application.controller;

import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.RecruitmentSeason;
import com.careerdock.application.dto.ApplicationCreateRequest;
import com.careerdock.application.dto.ApplicationResponse;
import com.careerdock.application.dto.ApplicationSearchCondition;
import com.careerdock.application.dto.ApplicationStatusUpdateRequest;
import com.careerdock.application.dto.ApplicationUpdateRequest;
import com.careerdock.application.service.ApplicationService;
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
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final CurrentUserAccessor currentUserAccessor;

    public ApplicationController(ApplicationService applicationService, CurrentUserAccessor currentUserAccessor) {
        this.applicationService = applicationService;
        this.currentUserAccessor = currentUserAccessor;
    }

    @GetMapping
    public List<ApplicationResponse> findAll(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) Integer recruitmentYear,
            @RequestParam(required = false) RecruitmentSeason season,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Instant deadlineFrom,
            @RequestParam(required = false) Instant deadlineTo
    ) {
        Long userId = currentUserAccessor.getCurrentUserId();
        ApplicationSearchCondition condition = new ApplicationSearchCondition(
                status,
                company,
                position,
                recruitmentYear,
                season,
                keyword,
                deadlineFrom,
                deadlineTo
        );
        return applicationService.findAll(userId, condition);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse create(@Valid @RequestBody ApplicationCreateRequest request) {
        return applicationService.create(currentUserAccessor.getCurrentUserId(), request);
    }

    @GetMapping("/{id}")
    public ApplicationResponse findOne(@PathVariable Long id) {
        return applicationService.findOne(currentUserAccessor.getCurrentUserId(), id);
    }

    @PatchMapping("/{id}")
    public ApplicationResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationUpdateRequest request
    ) {
        return applicationService.update(currentUserAccessor.getCurrentUserId(), id, request);
    }

    @PatchMapping("/{id}/status")
    public ApplicationResponse changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusUpdateRequest request
    ) {
        return applicationService.changeStatus(currentUserAccessor.getCurrentUserId(), id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        applicationService.delete(currentUserAccessor.getCurrentUserId(), id);
    }
}
