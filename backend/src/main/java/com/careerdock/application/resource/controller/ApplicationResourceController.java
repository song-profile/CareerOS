package com.careerdock.application.resource.controller;

import com.careerdock.application.resource.dto.ApplicationCredentialResponse;
import com.careerdock.application.resource.dto.ApplicationExternalLinkResponse;
import com.careerdock.application.resource.dto.ApplicationFileResponse;
import com.careerdock.application.resource.dto.ApplicationResourcesResponse;
import com.careerdock.application.resource.dto.LinkCredentialRequest;
import com.careerdock.application.resource.dto.LinkExternalLinkRequest;
import com.careerdock.application.resource.dto.LinkFileRequest;
import com.careerdock.application.resource.service.ApplicationResourceService;
import com.careerdock.global.auth.CurrentUserAccessor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications/{applicationId}")
public class ApplicationResourceController {

    private final ApplicationResourceService applicationResourceService;
    private final CurrentUserAccessor currentUserAccessor;

    public ApplicationResourceController(
            ApplicationResourceService applicationResourceService,
            CurrentUserAccessor currentUserAccessor
    ) {
        this.applicationResourceService = applicationResourceService;
        this.currentUserAccessor = currentUserAccessor;
    }

    @GetMapping("/resources")
    public ApplicationResourcesResponse findResources(@PathVariable Long applicationId) {
        return applicationResourceService.findResources(currentUserAccessor.getCurrentUserId(), applicationId);
    }

    @PostMapping("/files")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationFileResponse linkFile(
            @PathVariable Long applicationId,
            @Valid @RequestBody LinkFileRequest request
    ) {
        return applicationResourceService.linkFile(currentUserAccessor.getCurrentUserId(), applicationId, request);
    }

    @DeleteMapping("/files/{fileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlinkFile(@PathVariable Long applicationId, @PathVariable Long fileId) {
        applicationResourceService.unlinkFile(currentUserAccessor.getCurrentUserId(), applicationId, fileId);
    }

    @PostMapping("/credentials")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationCredentialResponse linkCredential(
            @PathVariable Long applicationId,
            @Valid @RequestBody LinkCredentialRequest request
    ) {
        return applicationResourceService.linkCredential(currentUserAccessor.getCurrentUserId(), applicationId, request);
    }

    @DeleteMapping("/credentials/{credentialId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlinkCredential(@PathVariable Long applicationId, @PathVariable Long credentialId) {
        applicationResourceService.unlinkCredential(currentUserAccessor.getCurrentUserId(), applicationId, credentialId);
    }

    @PostMapping("/external-links")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationExternalLinkResponse linkExternalLink(
            @PathVariable Long applicationId,
            @Valid @RequestBody LinkExternalLinkRequest request
    ) {
        return applicationResourceService.linkExternalLink(currentUserAccessor.getCurrentUserId(), applicationId, request);
    }

    @DeleteMapping("/external-links/{linkId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlinkExternalLink(@PathVariable Long applicationId, @PathVariable Long linkId) {
        applicationResourceService.unlinkExternalLink(currentUserAccessor.getCurrentUserId(), applicationId, linkId);
    }
}
