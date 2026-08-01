package com.careerdock.essay.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ExperienceTagRequest(
        @NotBlank(message = "태그 이름은 필수입니다.")
        @Size(max = 100, message = "태그 이름은 100자 이하여야 합니다.")
        String name,
        @Size(max = 500, message = "태그 설명은 500자 이하여야 합니다.")
        String description
) {
}
