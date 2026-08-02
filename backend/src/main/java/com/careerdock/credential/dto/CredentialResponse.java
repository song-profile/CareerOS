package com.careerdock.credential.dto;

import com.careerdock.credential.domain.Credential;
import com.careerdock.credential.domain.CredentialType;
import java.time.Instant;
import java.time.LocalDate;

/**
 * 목록·상세 공통 응답. 자격번호는 언제나 마스킹된 값만 나간다.
 */
public record CredentialResponse(
        Long id,
        CredentialType credentialType,
        String name,
        String issuer,
        LocalDate acquiredAt,
        String credentialNumberMasked,
        boolean hasCredentialNumber,
        String score,
        String grade,
        LocalDate validFrom,
        LocalDate expiresAt,
        boolean permanent,
        String description,
        String usageMemo,
        String studyMemo,
        String referenceUrl,
        Long fileAssetId,
        Instant createdAt,
        Instant updatedAt
) {
    public static CredentialResponse from(Credential credential, String credentialNumber) {
        return new CredentialResponse(
                credential.getId(),
                credential.getCredentialType(),
                credential.getName(),
                credential.getIssuer(),
                credential.getAcquiredAt(),
                mask(credentialNumber),
                credentialNumber != null && !credentialNumber.isBlank(),
                credential.getScore(),
                credential.getGrade(),
                credential.getValidFrom(),
                credential.getExpiresAt(),
                credential.isPermanent(),
                credential.getDescription(),
                credential.getUsageMemo(),
                credential.getStudyMemo(),
                credential.getReferenceUrl(),
                credential.getFileAssetId(),
                credential.getCreatedAt(),
                credential.getUpdatedAt()
        );
    }

    /**
     * 앞 4자만 남기고 가린다. 자격번호 체계가 제각각이라 자리수를 가정하지 않고
     * 길이에 따라 처리한다. 2자 이하는 전부 가려 값이 그대로 드러나지 않게 한다.
     * 프론트 maskValue와 같은 규칙이다.
     */
    static String mask(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.length() <= 2) {
            return "*".repeat(trimmed.length());
        }
        int visibleLength = Math.min(4, trimmed.length() - 2);
        return trimmed.substring(0, visibleLength) + "*".repeat(trimmed.length() - visibleLength);
    }
}
