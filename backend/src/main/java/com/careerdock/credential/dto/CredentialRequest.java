package com.careerdock.credential.dto;

import com.careerdock.credential.domain.CredentialType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * 등록·수정 공통 요청. PATCH도 전체 필드를 받는 전체 교체 방식이다.
 *
 * credentialNumber는 발급기관마다 체계가 달라 형식을 강제하지 않는다. 길이만 제한한다.
 */
public record CredentialRequest(
        @NotNull(message = "자격 구분은 필수입니다.")
        CredentialType credentialType,

        @NotBlank(message = "자격명은 필수입니다.")
        @Size(max = 150, message = "자격명은 150자 이하여야 합니다.")
        String name,

        @Size(max = 150, message = "발급기관은 150자 이하여야 합니다.")
        String issuer,

        @NotNull(message = "취득일은 필수입니다.")
        @PastOrPresent(message = "취득일은 오늘 이후일 수 없습니다.")
        LocalDate acquiredAt,

        @Size(max = 100, message = "자격번호는 100자 이하여야 합니다.")
        String credentialNumber,

        @Size(max = 50, message = "점수는 50자 이하여야 합니다.")
        String score,

        @Size(max = 50, message = "등급은 50자 이하여야 합니다.")
        String grade,

        LocalDate validFrom,
        LocalDate expiresAt,
        boolean permanent,

        @Size(max = 500, message = "자격 설명은 500자 이하여야 합니다.")
        String description,

        @Size(max = 1000, message = "내 활용 메모는 1000자 이하여야 합니다.")
        String usageMemo,

        @Size(max = 1000, message = "취득 후기는 1000자 이하여야 합니다.")
        String studyMemo,

        @Size(max = 1000, message = "관련 URL은 1000자 이하여야 합니다.")
        @Pattern(regexp = "^$|^https?://\\S+$", message = "관련 URL은 http 또는 https 주소여야 합니다.")
        String referenceUrl,

        /** 증빙 파일 id. 본인이 업로드한 파일만 연결할 수 있다. null이면 연결을 해제한다. */
        Long fileAssetId
) {
}
