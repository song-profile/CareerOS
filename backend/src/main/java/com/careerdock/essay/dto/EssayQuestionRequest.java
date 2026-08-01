package com.careerdock.essay.dto;

import com.careerdock.essay.domain.CommonQuestionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EssayQuestionRequest(
        @Min(value = 1, message = "문항 순서는 1 이상이어야 합니다.")
        int questionOrder,
        @NotBlank(message = "문항 내용은 필수입니다.")
        @Size(max = 2000, message = "문항 내용은 2000자 이하여야 합니다.")
        String questionText,
        @Min(value = 1, message = "글자 수 제한은 1 이상이어야 합니다.")
        @Max(value = 10000, message = "글자 수 제한은 10000 이하여야 합니다.")
        Integer characterLimit,
        @NotNull(message = "공통 질문 유형은 필수입니다.")
        CommonQuestionType commonQuestionType
) {
}
