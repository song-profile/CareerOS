package com.careerdock.essay.dto;

import com.careerdock.essay.domain.CommonQuestionType;
import com.careerdock.essay.domain.EssayAnswerStatus;

public record EssaySearchCondition(
        String company,
        String position,
        CommonQuestionType commonType,
        Long experienceTag,
        EssayAnswerStatus answerStatus,
        Integer recruitmentYear,
        String keyword
) {
}
