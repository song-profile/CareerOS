package com.careerdock.application.resource.dto;

import com.careerdock.essay.domain.CommonQuestionType;
import com.careerdock.essay.domain.EssayAnswer;
import com.careerdock.essay.domain.EssayQuestion;
import java.time.Instant;

/**
 * 자소서는 별도 연결 테이블이 없다. EssayQuestion이 이미 application_id를 직접 가지고
 * 있어서(essay_questions.application_id) 6단계에서 이 관계가 끝나 있었다. 여기서는 그
 * 문항에 실제로 제출된 답변이 있는지만 함께 보여준다.
 */
public record EssayQuestionSummaryResponse(
        Long id,
        int questionOrder,
        String questionText,
        CommonQuestionType commonQuestionType,
        boolean hasSubmittedAnswer,
        Long submittedAnswerId,
        Integer submittedAnswerVersion,
        Instant submittedAt
) {
    public static EssayQuestionSummaryResponse from(EssayQuestion question, EssayAnswer submittedAnswer) {
        return new EssayQuestionSummaryResponse(
                question.getId(),
                question.getQuestionOrder(),
                question.getQuestionText(),
                question.getCommonQuestionType(),
                submittedAnswer != null,
                submittedAnswer == null ? null : submittedAnswer.getId(),
                submittedAnswer == null ? null : submittedAnswer.getVersion(),
                submittedAnswer == null ? null : submittedAnswer.getSubmittedAt()
        );
    }
}
