package com.careerdock.application.resource.dto;

import com.careerdock.application.resource.domain.ApplicationExternalLink;
import com.careerdock.link.domain.ExternalLink;
import com.careerdock.link.domain.LinkType;
import java.time.Instant;

public record ApplicationExternalLinkResponse(
        Long id,
        Long externalLinkId,
        LinkType linkType,
        String displayName,
        String url,
        String purpose,
        Instant linkedAt
) {
    public static ApplicationExternalLinkResponse from(ApplicationExternalLink link) {
        ExternalLink externalLink = link.getExternalLink();
        return new ApplicationExternalLinkResponse(
                link.getId(),
                externalLink.getId(),
                externalLink.getLinkType(),
                externalLink.getDisplayName(),
                externalLink.getUrl(),
                link.getPurpose(),
                link.getLinkedAt()
        );
    }
}
