package com.careerdock.application.dto;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.RecruitmentSeason;
import java.time.Instant;
import java.util.List;

public record ApplicationResponse(
        Long id,
        Long companyId,
        String companyName,
        String companyHomepageUrl,
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
        String memo,
        Instant submittedAt,
        Instant createdAt,
        Instant updatedAt,
        List<ApplicationStatusHistoryResponse> statusHistories
) {
    public static ApplicationResponse from(Application application, List<ApplicationStatusHistoryResponse> histories) {
        return new ApplicationResponse(
                application.getId(),
                application.getCompany().getId(),
                application.getCompany().getName(),
                application.getCompany().getHomepageUrl(),
                application.getPositionName(),
                application.getRecruitmentTitle(),
                application.getRecruitmentYear(),
                application.getSeason(),
                application.getPostingUrl(),
                application.getApplicationStartAt(),
                application.getDeadlineAt(),
                application.getStatus(),
                application.getWorkLocation(),
                application.getApplicationSiteUrl(),
                application.getMemo(),
                application.getSubmittedAt(),
                application.getCreatedAt(),
                application.getUpdatedAt(),
                histories
        );
    }
}
