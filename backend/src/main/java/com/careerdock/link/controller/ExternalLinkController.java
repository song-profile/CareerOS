package com.careerdock.link.controller;

import com.careerdock.global.auth.CurrentUserAccessor;
import com.careerdock.link.dto.ExternalLinkRequest;
import com.careerdock.link.dto.ExternalLinkResponse;
import com.careerdock.link.service.ExternalLinkService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/external-links")
public class ExternalLinkController {

    private final ExternalLinkService externalLinkService;
    private final CurrentUserAccessor currentUserAccessor;

    public ExternalLinkController(ExternalLinkService externalLinkService, CurrentUserAccessor currentUserAccessor) {
        this.externalLinkService = externalLinkService;
        this.currentUserAccessor = currentUserAccessor;
    }

    @GetMapping
    public List<ExternalLinkResponse> findAll() {
        return externalLinkService.findAll(currentUserAccessor.getCurrentUserId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExternalLinkResponse create(@Valid @RequestBody ExternalLinkRequest request) {
        return externalLinkService.create(currentUserAccessor.getCurrentUserId(), request);
    }

    @PatchMapping("/{id}")
    public ExternalLinkResponse update(@PathVariable Long id, @Valid @RequestBody ExternalLinkRequest request) {
        return externalLinkService.update(currentUserAccessor.getCurrentUserId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        externalLinkService.delete(currentUserAccessor.getCurrentUserId(), id);
    }
}
