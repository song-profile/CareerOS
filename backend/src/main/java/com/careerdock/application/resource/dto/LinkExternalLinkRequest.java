package com.careerdock.application.resource.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LinkExternalLinkRequest(
        @NotNull(message = "연결할 외부 링크 id는 필수입니다.")
        Long externalLinkId,

        @Size(max = 100, message = "용도는 100자 이하여야 합니다.")
        String purpose
) {
}
