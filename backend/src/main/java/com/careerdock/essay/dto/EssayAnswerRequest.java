package com.careerdock.essay.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EssayAnswerRequest(
        @NotNull(message = "답변 내용은 필수입니다.")
        @Size(max = 20000, message = "답변 내용은 20000자 이하여야 합니다.")
        String content
) {
}
