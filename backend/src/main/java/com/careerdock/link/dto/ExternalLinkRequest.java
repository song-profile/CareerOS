package com.careerdock.link.dto;

import com.careerdock.link.domain.LinkType;
import com.careerdock.link.domain.LinkVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * URL은 http/https만 받는다. javascript: 같은 스킴은 패턴에서 걸러진다.
 */
public record ExternalLinkRequest(
        @NotNull(message = "링크 유형은 필수입니다.")
        LinkType linkType,

        @NotBlank(message = "표시 이름은 필수입니다.")
        @Size(max = 150, message = "표시 이름은 150자 이하여야 합니다.")
        String displayName,

        @NotBlank(message = "URL은 필수입니다.")
        @Size(max = 1000, message = "URL은 1000자 이하여야 합니다.")
        @Pattern(regexp = "^https?://\\S+$", message = "URL은 http 또는 https 주소여야 합니다.")
        String url,

        @Size(max = 300, message = "설명은 300자 이하여야 합니다.")
        String description,

        LinkVisibility visibility,

        @Size(max = 150, message = "프로젝트 이름은 150자 이하여야 합니다.")
        String projectName
) {
}
