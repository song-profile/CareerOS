package com.careerdock.credential.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * 자격번호 전체 조회 감사 기록.
 *
 * 누가 어떤 자격의 전체 번호를 언제 봤는지만 남긴다. 번호 값 자체는 절대 기록하지 않는다.
 */
@Entity
@Table(name = "credential_access_audits")
public class CredentialAccessAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "credential_id", nullable = false)
    private Long credentialId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "accessed_at", nullable = false)
    private Instant accessedAt;

    protected CredentialAccessAudit() {
    }

    private CredentialAccessAudit(Long credentialId, Long userId) {
        this.credentialId = credentialId;
        this.userId = userId;
        this.accessedAt = Instant.now();
    }

    public static CredentialAccessAudit numberViewed(Long credentialId, Long userId) {
        return new CredentialAccessAudit(credentialId, userId);
    }

    public Long getId() { return id; }
    public Long getCredentialId() { return credentialId; }
    public Long getUserId() { return userId; }
    public Instant getAccessedAt() { return accessedAt; }
}
