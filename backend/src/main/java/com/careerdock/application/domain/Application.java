package com.careerdock.application.domain;

import com.careerdock.company.domain.Company;
import com.careerdock.global.domain.BaseTimeEntity;
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
import java.time.Instant;

@Entity
@Table(name = "applications")
public class Application extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "position_name", nullable = false, length = 150)
    private String positionName;

    @Column(name = "recruitment_title", length = 200)
    private String recruitmentTitle;

    @Column(name = "recruitment_year", nullable = false)
    private int recruitmentYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RecruitmentSeason season;

    @Column(name = "posting_url", length = 1000)
    private String postingUrl;

    @Column(name = "application_start_at")
    private Instant applicationStartAt;

    @Column(name = "deadline_at")
    private Instant deadlineAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ApplicationStatus status;

    @Column(name = "work_location", length = 150)
    private String workLocation;

    @Column(name = "application_site_url", length = 1000)
    private String applicationSiteUrl;

    @Column(length = 500)
    private String memo;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    protected Application() {
    }

    private Application(
            User user,
            Company company,
            String positionName,
            String recruitmentTitle,
            int recruitmentYear,
            RecruitmentSeason season,
            String postingUrl,
            Instant applicationStartAt,
            Instant deadlineAt,
            ApplicationStatus status,
            String workLocation,
            String applicationSiteUrl,
            String memo
    ) {
        this.user = user;
        this.company = company;
        this.positionName = positionName;
        this.recruitmentTitle = recruitmentTitle;
        this.recruitmentYear = recruitmentYear;
        this.season = season;
        this.postingUrl = blankToNull(postingUrl);
        this.applicationStartAt = applicationStartAt;
        this.deadlineAt = deadlineAt;
        this.status = status;
        this.workLocation = blankToNull(workLocation);
        this.applicationSiteUrl = blankToNull(applicationSiteUrl);
        this.memo = blankToNull(memo);
        this.submittedAt = status == ApplicationStatus.SUBMITTED ? Instant.now() : null;
    }

    public static Application create(
            User user,
            Company company,
            String positionName,
            String recruitmentTitle,
            int recruitmentYear,
            RecruitmentSeason season,
            String postingUrl,
            Instant applicationStartAt,
            Instant deadlineAt,
            ApplicationStatus status,
            String workLocation,
            String applicationSiteUrl,
            String memo
    ) {
        return new Application(
                user,
                company,
                positionName,
                blankToNull(recruitmentTitle),
                recruitmentYear,
                season,
                postingUrl,
                applicationStartAt,
                deadlineAt,
                status,
                workLocation,
                applicationSiteUrl,
                memo
        );
    }

    public void update(
            Company company,
            String positionName,
            String recruitmentTitle,
            int recruitmentYear,
            RecruitmentSeason season,
            String postingUrl,
            Instant applicationStartAt,
            Instant deadlineAt,
            String workLocation,
            String applicationSiteUrl,
            String memo
    ) {
        this.company = company;
        this.positionName = positionName;
        this.recruitmentTitle = blankToNull(recruitmentTitle);
        this.recruitmentYear = recruitmentYear;
        this.season = season;
        this.postingUrl = blankToNull(postingUrl);
        this.applicationStartAt = applicationStartAt;
        this.deadlineAt = deadlineAt;
        this.workLocation = blankToNull(workLocation);
        this.applicationSiteUrl = blankToNull(applicationSiteUrl);
        this.memo = blankToNull(memo);
    }

    public ApplicationStatus changeStatus(ApplicationStatus newStatus) {
        ApplicationStatus previousStatus = status;
        if (previousStatus == newStatus) {
            return previousStatus;
        }
        this.status = newStatus;
        if (newStatus == ApplicationStatus.SUBMITTED && submittedAt == null) {
            submittedAt = Instant.now();
        }
        return previousStatus;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Company getCompany() {
        return company;
    }

    public String getPositionName() {
        return positionName;
    }

    public String getRecruitmentTitle() {
        return recruitmentTitle;
    }

    public int getRecruitmentYear() {
        return recruitmentYear;
    }

    public RecruitmentSeason getSeason() {
        return season;
    }

    public String getPostingUrl() {
        return postingUrl;
    }

    public Instant getApplicationStartAt() {
        return applicationStartAt;
    }

    public Instant getDeadlineAt() {
        return deadlineAt;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public String getWorkLocation() {
        return workLocation;
    }

    public String getApplicationSiteUrl() {
        return applicationSiteUrl;
    }

    public String getMemo() {
        return memo;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }
}
