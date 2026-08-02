package com.careerdock.application.resource.dto;

import com.careerdock.application.resource.domain.ApplicationFile;
import com.careerdock.file.domain.FileAsset;
import com.careerdock.file.domain.FileCategory;
import java.time.Instant;

public record ApplicationFileResponse(
        Long id,
        Long fileAssetId,
        FileCategory category,
        String displayName,
        String originalFilename,
        String mimeType,
        long size,
        int lockedVersion,
        String downloadUrl,
        String purpose,
        Instant linkedAt
) {
    public static ApplicationFileResponse from(ApplicationFile link) {
        FileAsset file = link.getFileAsset();
        return new ApplicationFileResponse(
                link.getId(),
                file.getId(),
                file.getCategory(),
                file.getDisplayName(),
                file.getOriginalFilename(),
                file.getMimeType(),
                file.getSize(),
                link.getLockedVersion(),
                "/api/files/" + file.getId() + "/download",
                link.getPurpose(),
                link.getLinkedAt()
        );
    }
}
