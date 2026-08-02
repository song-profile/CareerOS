package com.careerdock.application.resource.domain;

import com.careerdock.application.domain.Application;
import com.careerdock.credential.domain.Credential;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

/** 지원 건에 연결한 자격 정보. 연결을 지워도 {@link Credential} 원본은 그대로 남는다. */
@Entity
@Table(
        name = "application_credentials",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_application_credentials_application_credential",
                columnNames = {"application_id", "credential_id"}
        )
)
public class ApplicationCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "credential_id", nullable = false)
    private Credential credential;

    @Column(length = 100)
    private String purpose;

    @Column(name = "linked_at", nullable = false, updatable = false)
    private Instant linkedAt;

    protected ApplicationCredential() {
    }

    public static ApplicationCredential create(Application application, Credential credential, String purpose) {
        ApplicationCredential link = new ApplicationCredential();
        link.application = application;
        link.credential = credential;
        link.purpose = blankToNull(purpose);
        link.linkedAt = Instant.now();
        return link;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    public Long getId() { return id; }

    public Application getApplication() { return application; }

    public Credential getCredential() { return credential; }

    public String getPurpose() { return purpose; }

    public Instant getLinkedAt() { return linkedAt; }
}
