package com.careerdock.application.dto;

import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.RecruitmentSeason;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import org.hibernate.validator.constraints.URL;

public record ApplicationCreateRequest(
        @NotBlank(message = "회사명은 필수입니다.")
        @Size(max = 150, message = "회사명은 150자 이하여야 합니다.")
        String companyName,

        @URL(message = "회사 홈페이지 URL 형식이 올바르지 않습니다.")
        @Size(max = 1000, message = "회사 홈페이지 URL은 1000자 이하여야 합니다.")
        String companyHomepageUrl,

        @Size(max = 500, message = "회사 메모는 500자 이하여야 합니다.")
        String companyMemo,

        @NotBlank(message = "직무명은 필수입니다.")
        @Size(max = 150, message = "직무명은 150자 이하여야 합니다.")
        String positionName,

        @Size(max = 200, message = "채용 제목은 200자 이하여야 합니다.")
        String recruitmentTitle,

        @Min(value = 2000, message = "채용연도는 2000년 이후여야 합니다.")
        @Max(value = 2100, message = "채용연도는 2100년 이하여야 합니다.")
        int recruitmentYear,

        @NotNull(message = "채용시기는 필수입니다.")
        RecruitmentSeason season,

        @URL(message = "공고 URL 형식이 올바르지 않습니다.")
        @Size(max = 1000, message = "공고 URL은 1000자 이하여야 합니다.")
        String postingUrl,

        Instant applicationStartAt,

        Instant deadlineAt,

        @NotNull(message = "지원 상태는 필수입니다.")
        ApplicationStatus status,

        @Size(max = 150, message = "근무지역은 150자 이하여야 합니다.")
        String workLocation,

        @URL(message = "지원 사이트 URL 형식이 올바르지 않습니다.")
        @Size(max = 1000, message = "지원 사이트 URL은 1000자 이하여야 합니다.")
        String applicationSiteUrl,

        @Size(max = 500, message = "메모는 500자 이하여야 합니다.")
        String memo
) {
    @AssertTrue(message = "마감일은 시작일보다 이전일 수 없습니다.")
    public boolean isDeadlineValid() {
        return applicationStartAt == null || deadlineAt == null || !deadlineAt.isBefore(applicationStartAt);
    }
}
