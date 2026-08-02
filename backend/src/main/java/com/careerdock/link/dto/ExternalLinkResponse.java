package com.careerdock.link.dto;

import com.careerdock.link.domain.ExternalLink;
import com.careerdock.link.domain.LinkType;
import com.careerdock.link.domain.LinkVisibility;
import java.time.Instant;

public record ExternalLinkResponse(
        Long id,
        LinkType linkType,
        String displayName,
        String url,
        String description,
        LinkVisibility visibility,
        String projectName,
        Instant createdAt,
        Instant updatedAt
) {
    public static ExternalLinkResponse from(ExternalLink link) {
        return new ExternalLinkResponse(
                link.getId(),
                link.getLinkType(),
                link.getDisplayName(),
                link.getUrl(),
                link.getDescription(),
                link.getVisibility(),
                link.getProjectName(),
                link.getCreatedAt(),
                link.getUpdatedAt()
        );
    }
}
