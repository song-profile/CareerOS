package com.careerdock.application.domain;

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
import java.time.Instant;

@Entity
@Table(name = "application_status_histories")
public class ApplicationStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", nullable = false, length = 40)
    private ApplicationStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 40)
    private ApplicationStatus newStatus;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    protected ApplicationStatusHistory() {
    }

    private ApplicationStatusHistory(Application application, ApplicationStatus previousStatus, ApplicationStatus newStatus) {
        this.application = application;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedAt = Instant.now();
    }

    public static ApplicationStatusHistory create(
            Application application,
            ApplicationStatus previousStatus,
            ApplicationStatus newStatus
    ) {
        return new ApplicationStatusHistory(application, previousStatus, newStatus);
    }

    public Long getId() {
        return id;
    }

    public Application getApplication() {
        return application;
    }

    public ApplicationStatus getPreviousStatus() {
        return previousStatus;
    }

    public ApplicationStatus getNewStatus() {
        return newStatus;
    }

    public Instant getChangedAt() {
        return changedAt;
    }
}
