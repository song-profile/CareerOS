package com.careerdock.essay.dto;

import com.careerdock.essay.domain.CommonQuestionType;
import com.careerdock.essay.domain.EssayQuestion;

public record EssayQuestionResponse(
        Long id,
        Long applicationId,
        int questionOrder,
        String questionText,
        Integer characterLimit,
        CommonQuestionType commonQuestionType
) {
    public static EssayQuestionResponse from(EssayQuestion question) {
        return new EssayQuestionResponse(
                question.getId(),
                question.getApplication().getId(),
                question.getQuestionOrder(),
                question.getQuestionText(),
                question.getCharacterLimit(),
                question.getCommonQuestionType()
        );
    }
}
