package com.careerdock.credential.dto;

/**
 * 자격번호 전체 조회 전용 응답. 본인 요청에만 나가고 접근 기록이 남는다.
 */
public record CredentialNumberResponse(Long credentialId, String credentialNumber) {
}
