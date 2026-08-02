package com.careerdock.application.resource.dto;

import com.careerdock.application.resource.domain.ApplicationCredential;
import com.careerdock.credential.domain.Credential;
import com.careerdock.credential.domain.CredentialType;
import java.time.Instant;

/**
 * 자격번호는 여기서 다루지 않는다. 마스킹된 값이 필요하면 {@code GET /api/credentials/{id}}를
 * 따로 부른다. 이 응답은 "무엇이 연결돼 있는지"만 보여주면 되고, 복호화는 그 자체로 필요 없는
 * 작업을 매 조회마다 반복하는 셈이 된다.
 */
public record ApplicationCredentialResponse(
        Long id,
        Long credentialId,
        CredentialType credentialType,
        String name,
        String issuer,
        String purpose,
        Instant linkedAt
) {
    public static ApplicationCredentialResponse from(ApplicationCredential link) {
        Credential credential = link.getCredential();
        return new ApplicationCredentialResponse(
                link.getId(),
                credential.getId(),
                credential.getCredentialType(),
                credential.getName(),
                credential.getIssuer(),
                link.getPurpose(),
                link.getLinkedAt()
        );
    }
}
