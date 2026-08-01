package com.careerdock.essay.dto;

import jakarta.validation.constraints.NotNull;

public record EssayAnswerTagRequest(
        @NotNull(message = "태그 ID는 필수입니다.")
        Long tagId
) {
}
