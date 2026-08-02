package com.careerdock.credential.controller;

import com.careerdock.credential.domain.CredentialType;
import com.careerdock.credential.dto.CredentialNumberResponse;
import com.careerdock.credential.dto.CredentialRequest;
import com.careerdock.credential.dto.CredentialResponse;
import com.careerdock.credential.service.CredentialService;
import com.careerdock.global.auth.CurrentUserAccessor;
import jakarta.validation.Valid;
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
@RequestMapping("/api/credentials")
public class CredentialController {

    private final CredentialService credentialService;
    private final CurrentUserAccessor currentUserAccessor;

    public CredentialController(CredentialService credentialService, CurrentUserAccessor currentUserAccessor) {
        this.credentialService = credentialService;
        this.currentUserAccessor = currentUserAccessor;
    }

    @GetMapping
    public List<CredentialResponse> findAll(
            @RequestParam(required = false) CredentialType type,
            @RequestParam(required = false) Integer expiringInDays
    ) {
        return credentialService.findAll(currentUserAccessor.getCurrentUserId(), type, expiringInDays);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CredentialResponse create(@Valid @RequestBody CredentialRequest request) {
        return credentialService.create(currentUserAccessor.getCurrentUserId(), request);
    }

    @GetMapping("/{id}")
    public CredentialResponse findOne(@PathVariable Long id) {
        return credentialService.findOne(currentUserAccessor.getCurrentUserId(), id);
    }

    @PatchMapping("/{id}")
    public CredentialResponse update(@PathVariable Long id, @Valid @RequestBody CredentialRequest request) {
        return credentialService.update(currentUserAccessor.getCurrentUserId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        credentialService.delete(currentUserAccessor.getCurrentUserId(), id);
    }

    /** 마스킹 없는 전체 번호. 본인 소유만 조회되고 접근 기록이 남는다. */
    @GetMapping("/{id}/number")
    public CredentialNumberResponse readNumber(@PathVariable Long id) {
        return credentialService.readNumber(currentUserAccessor.getCurrentUserId(), id);
    }
}
