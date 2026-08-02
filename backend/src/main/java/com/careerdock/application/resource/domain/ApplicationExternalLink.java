package com.careerdock.application.resource.domain;

import com.careerdock.application.domain.Application;
import com.careerdock.link.domain.ExternalLink;
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

/** 지원 건에 연결한 외부 링크. 연결을 지워도 {@link ExternalLink} 원본은 그대로 남는다. */
@Entity
@Table(
        name = "application_external_links",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_application_external_links_application_link",
                columnNames = {"application_id", "external_link_id"}
        )
)
public class ApplicationExternalLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "external_link_id", nullable = false)
    private ExternalLink externalLink;

    @Column(length = 100)
    private String purpose;

    @Column(name = "linked_at", nullable = false, updatable = false)
    private Instant linkedAt;

    protected ApplicationExternalLink() {
    }

    public static ApplicationExternalLink create(Application application, ExternalLink externalLink, String purpose) {
        ApplicationExternalLink link = new ApplicationExternalLink();
        link.application = application;
        link.externalLink = externalLink;
        link.purpose = blankToNull(purpose);
        link.linkedAt = Instant.now();
        return link;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    public Long getId() { return id; }

    public Application getApplication() { return application; }

    public ExternalLink getExternalLink() { return externalLink; }

    public String getPurpose() { return purpose; }

    public Instant getLinkedAt() { return linkedAt; }
}
