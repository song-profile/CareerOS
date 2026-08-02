package com.careerdock.credential.domain;

import com.careerdock.global.domain.BaseTimeEntity;
import com.careerdock.global.exception.BadRequestException;
import com.careerdock.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "credentials")
public class Credential extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "credential_type", nullable = false, length = 40)
    private CredentialType credentialType;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 150)
    private String issuer;

    @Column(name = "acquired_at", nullable = false)
    private LocalDate acquiredAt;

    /** 항상 암호문만 담는다. 평문은 어떤 경로로도 이 컬럼에 들어가면 안 된다. */
    @Column(name = "credential_number_encrypted", length = 500)
    private String credentialNumberEncrypted;

    @Column(length = 50)
    private String score;

    @Column(length = 50)
    private String grade;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    @Column(nullable = false)
    private boolean permanent;

    @Column(length = 500)
    private String description;

    @Column(name = "usage_memo", length = 1000)
    private String usageMemo;

    @Column(name = "study_memo", length = 1000)
    private String studyMemo;

    @Column(name = "reference_url", length = 1000)
    private String referenceUrl;

    /** 7단계 파일 모듈 연동용 자리. 지금은 항상 null이다. */
    @Column(name = "file_asset_id")
    private Long fileAssetId;

    protected Credential() {
    }

    private Credential(User user) {
        this.user = user;
    }

    public static Credential create(
            User user,
            CredentialType credentialType,
            String name,
            String issuer,
            LocalDate acquiredAt,
            String credentialNumberEncrypted,
            String score,
            String grade,
            LocalDate validFrom,
            LocalDate expiresAt,
            boolean permanent,
            String description,
            String usageMemo,
            String studyMemo,
            String referenceUrl
    ) {
        Credential credential = new Credential(user);
        credential.apply(
                credentialType, name, issuer, acquiredAt, score, grade,
                validFrom, expiresAt, permanent, description, usageMemo, studyMemo, referenceUrl
        );
        credential.credentialNumberEncrypted = credentialNumberEncrypted;
        return credential;
    }

    public void update(
            CredentialType credentialType,
            String name,
            String issuer,
            LocalDate acquiredAt,
            String score,
            String grade,
            LocalDate validFrom,
            LocalDate expiresAt,
            boolean permanent,
            String description,
            String usageMemo,
            String studyMemo,
            String referenceUrl
    ) {
        apply(
                credentialType, name, issuer, acquiredAt, score, grade,
                validFrom, expiresAt, permanent, description, usageMemo, studyMemo, referenceUrl
        );
    }

    /** 암호문 교체는 별도 경로로만 한다. null이면 기존 값을 유지한다. */
    public void replaceCredentialNumber(String credentialNumberEncrypted) {
        this.credentialNumberEncrypted = credentialNumberEncrypted;
    }

    private void apply(
            CredentialType credentialType,
            String name,
            String issuer,
            LocalDate acquiredAt,
            String score,
            String grade,
            LocalDate validFrom,
            LocalDate expiresAt,
            boolean permanent,
            String description,
            String usageMemo,
            String studyMemo,
            String referenceUrl
    ) {
        // 영구 자격은 만료일을 갖지 않는다. 둘 다 들어오면 어느 쪽이 참인지 알 수 없어 거절한다.
        if (permanent && expiresAt != null) {
            throw new BadRequestException("영구 자격에는 만료일을 함께 입력할 수 없습니다.");
        }
        if (validFrom != null && expiresAt != null && validFrom.isAfter(expiresAt)) {
            throw new BadRequestException("만료일은 유효기간 시작일 이후여야 합니다.");
        }
        if (validFrom != null && validFrom.isBefore(acquiredAt)) {
            throw new BadRequestException("유효기간 시작일은 취득일 이후여야 합니다.");
        }
        if (expiresAt != null && expiresAt.isBefore(acquiredAt)) {
            throw new BadRequestException("만료일은 취득일 이후여야 합니다.");
        }

        this.credentialType = credentialType;
        this.name = name.trim();
        this.issuer = issuer;
        this.acquiredAt = acquiredAt;
        this.score = score;
        this.grade = grade;
        this.validFrom = validFrom;
        this.expiresAt = expiresAt;
        this.permanent = permanent;
        this.description = description;
        this.usageMemo = usageMemo;
        this.studyMemo = studyMemo;
        this.referenceUrl = referenceUrl;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public CredentialType getCredentialType() { return credentialType; }
    public String getName() { return name; }
    public String getIssuer() { return issuer; }
    public LocalDate getAcquiredAt() { return acquiredAt; }
    public String getCredentialNumberEncrypted() { return credentialNumberEncrypted; }
    public String getScore() { return score; }
    public String getGrade() { return grade; }
    public LocalDate getValidFrom() { return validFrom; }
    public LocalDate getExpiresAt() { return expiresAt; }
    public boolean isPermanent() { return permanent; }
    public String getDescription() { return description; }
    public String getUsageMemo() { return usageMemo; }
    public String getStudyMemo() { return studyMemo; }
    public String getReferenceUrl() { return referenceUrl; }
    public Long getFileAssetId() { return fileAssetId; }
}
