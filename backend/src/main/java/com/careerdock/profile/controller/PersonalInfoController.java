package com.careerdock.profile.controller;

import com.careerdock.global.auth.CurrentUserAccessor;
import com.careerdock.profile.dto.PersonalInfoRequest;
import com.careerdock.profile.dto.PersonalInfoResponse;
import com.careerdock.profile.service.PersonalInfoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class PersonalInfoController {

    private final PersonalInfoService personalInfoService;
    private final CurrentUserAccessor currentUserAccessor;

    public PersonalInfoController(PersonalInfoService personalInfoService, CurrentUserAccessor currentUserAccessor) {
        this.personalInfoService = personalInfoService;
        this.currentUserAccessor = currentUserAccessor;
    }

    @GetMapping
    public PersonalInfoResponse find() {
        return personalInfoService.find(currentUserAccessor.getCurrentUserId());
    }

    @PatchMapping
    public PersonalInfoResponse update(@Valid @RequestBody PersonalInfoRequest request) {
        return personalInfoService.update(currentUserAccessor.getCurrentUserId(), request);
    }
}
