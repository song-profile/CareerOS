package com.careerdock.application.dto;

import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.RecruitmentSeason;
import java.time.Instant;

public record ApplicationSearchCondition(
        ApplicationStatus status,
        String company,
        String position,
        Integer recruitmentYear,
        RecruitmentSeason season,
        String keyword,
        Instant deadlineFrom,
        Instant deadlineTo
) {
}
