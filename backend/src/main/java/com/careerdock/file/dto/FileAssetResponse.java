package com.careerdock.file.dto;

import com.careerdock.file.domain.FileAsset;
import com.careerdock.file.domain.FileCategory;
import java.time.Instant;

/**
 * 목록·상세 공통 응답.
 *
 * storageKey는 내보내지 않는다. 스토리지 내부 구조를 드러내고, 클라이언트가 그 값을 되돌려
 * 보내도록 유도할 이유가 없다. 다운로드는 언제나 id로만 한다. 공개 URL도 만들지 않는다.
 */
public record FileAssetResponse(
        Long id,
        FileCategory category,
        String displayName,
        String originalFilename,
        String mimeType,
        long size,
        int version,
        Long parentAssetId,
        String downloadUrl,
        Instant createdAt,
        Instant updatedAt
) {
    public static FileAssetResponse from(FileAsset asset) {
        return new FileAssetResponse(
                asset.getId(),
                asset.getCategory(),
                asset.getDisplayName(),
                asset.getOriginalFilename(),
                asset.getMimeType(),
                asset.getSize(),
                asset.getVersion(),
                asset.getParentAssetId(),
                "/api/files/" + asset.getId() + "/download",
                asset.getCreatedAt(),
                asset.getUpdatedAt()
        );
    }
}
