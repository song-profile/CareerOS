package com.careerdock.application.resource.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LinkFileRequest(
        @NotNull(message = "연결할 파일 id는 필수입니다.")
        Long fileAssetId,

        @Size(max = 100, message = "용도는 100자 이하여야 합니다.")
        String purpose
) {
}
