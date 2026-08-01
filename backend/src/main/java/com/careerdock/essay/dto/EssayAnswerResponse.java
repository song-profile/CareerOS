package com.careerdock.essay.dto;

import com.careerdock.essay.domain.EssayAnswer;
import com.careerdock.essay.domain.EssayAnswerStatus;
import java.time.Instant;
import java.util.List;

public record EssayAnswerResponse(
        Long id,
        Long questionId,
        Long applicationId,
        String companyName,
        String positionName,
        String questionText,
        String content,
        int characterCount,
        int version,
        EssayAnswerStatus status,
        Instant submittedAt,
        Instant createdAt,
        Instant updatedAt,
        List<ExperienceTagResponse> experienceTags
) {
    public static EssayAnswerResponse from(EssayAnswer answer, List<ExperienceTagResponse> tags) {
        return new EssayAnswerResponse(
                answer.getId(),
                answer.getQuestion().getId(),
                answer.getQuestion().getApplication().getId(),
                answer.getQuestion().getApplication().getCompany().getName(),
                answer.getQuestion().getApplication().getPositionName(),
                answer.getQuestion().getQuestionText(),
                answer.getContent(),
                answer.getCharacterCount(),
                answer.getVersion(),
                answer.getStatus(),
                answer.getSubmittedAt(),
                answer.getCreatedAt(),
                answer.getUpdatedAt(),
                tags
        );
    }
}
