package com.careerdock.essay.controller;

import com.careerdock.essay.domain.CommonQuestionType;
import com.careerdock.essay.domain.EssayAnswerStatus;
import com.careerdock.essay.dto.*;
import com.careerdock.essay.service.EssayService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class EssayController {

    private final EssayService essayService;
    private final CurrentUserAccessor currentUserAccessor;

    public EssayController(EssayService essayService, CurrentUserAccessor currentUserAccessor) {
        this.essayService = essayService;
        this.currentUserAccessor = currentUserAccessor;
    }

    @GetMapping("/essays")
    public List<EssayAnswerResponse> findEssays(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String position,
            @RequestParam(required = false) CommonQuestionType commonType,
            @RequestParam(required = false) Long experienceTag,
            @RequestParam(required = false) EssayAnswerStatus answerStatus,
            @RequestParam(required = false) Integer recruitmentYear,
            @RequestParam(required = false) String keyword
    ) {
        EssaySearchCondition condition = new EssaySearchCondition(
                company,
                position,
                commonType,
                experienceTag,
                answerStatus,
                recruitmentYear,
                keyword
        );
        return essayService.findAnswers(currentUserAccessor.getCurrentUserId(), condition);
    }

    @PostMapping("/applications/{applicationId}/essay-questions")
    @ResponseStatus(HttpStatus.CREATED)
    public EssayQuestionResponse createQuestion(
            @PathVariable Long applicationId,
            @Valid @RequestBody EssayQuestionRequest request
    ) {
        return essayService.createQuestion(currentUserAccessor.getCurrentUserId(), applicationId, request);
    }

    @GetMapping("/applications/{applicationId}/essay-questions")
    public List<EssayQuestionResponse> findQuestions(@PathVariable Long applicationId) {
        return essayService.findQuestions(currentUserAccessor.getCurrentUserId(), applicationId);
    }

    @PatchMapping("/essay-questions/{id}")
    public EssayQuestionResponse updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody EssayQuestionRequest request
    ) {
        return essayService.updateQuestion(currentUserAccessor.getCurrentUserId(), id, request);
    }

    @PostMapping("/essay-questions/{questionId}/answers")
    @ResponseStatus(HttpStatus.CREATED)
    public EssayAnswerResponse createAnswer(
            @PathVariable Long questionId,
            @Valid @RequestBody EssayAnswerRequest request
    ) {
        return essayService.createAnswer(currentUserAccessor.getCurrentUserId(), questionId, request);
    }

    @PatchMapping("/essay-answers/{id}")
    public EssayAnswerResponse updateAnswer(@PathVariable Long id, @Valid @RequestBody EssayAnswerRequest request) {
        return essayService.updateAnswer(currentUserAccessor.getCurrentUserId(), id, request);
    }

    @PostMapping("/essay-answers/{id}/versions")
    @ResponseStatus(HttpStatus.CREATED)
    public EssayAnswerResponse createImprovedVersion(
            @PathVariable Long id,
            @Valid @RequestBody EssayAnswerRequest request
    ) {
        return essayService.createImprovedVersion(currentUserAccessor.getCurrentUserId(), id, request);
    }

    @PostMapping("/essay-answers/{id}/submit-lock")
    public EssayAnswerResponse submitLock(@PathVariable Long id, @Valid @RequestBody EssayAnswerRequest request) {
        return essayService.submitLock(currentUserAccessor.getCurrentUserId(), id, request);
    }

    @GetMapping("/essay-answers/{id}/versions")
    public List<EssayAnswerResponse> findVersions(@PathVariable Long id) {
        return essayService.findVersions(currentUserAccessor.getCurrentUserId(), id);
    }

    @GetMapping("/experience-tags")
    public List<ExperienceTagResponse> findTags() {
        return essayService.findTags(currentUserAccessor.getCurrentUserId());
    }

    @PostMapping("/experience-tags")
    @ResponseStatus(HttpStatus.CREATED)
    public ExperienceTagResponse createTag(@Valid @RequestBody ExperienceTagRequest request) {
        return essayService.createTag(currentUserAccessor.getCurrentUserId(), request);
    }

    @PostMapping("/essay-answers/{id}/tags")
    public EssayAnswerResponse addTag(@PathVariable Long id, @Valid @RequestBody EssayAnswerTagRequest request) {
        return essayService.addTag(currentUserAccessor.getCurrentUserId(), id, request);
    }

    @DeleteMapping("/essay-answers/{id}/tags/{tagId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeTag(@PathVariable Long id, @PathVariable Long tagId) {
        essayService.removeTag(currentUserAccessor.getCurrentUserId(), id, tagId);
    }
}
