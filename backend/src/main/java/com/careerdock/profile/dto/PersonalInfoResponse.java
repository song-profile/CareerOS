package com.careerdock.profile.dto;

import com.careerdock.profile.domain.GraduationStatus;
import com.careerdock.profile.domain.MilitaryStatus;
import com.careerdock.profile.domain.PersonalInfo;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record PersonalInfoResponse(
        String phone,
        String address,
        String schoolName,
        String major,
        String doubleMajor,
        String minor,
        GraduationStatus graduationStatus,
        LocalDate graduationDate,
        BigDecimal gpa,
        BigDecimal gpaScale,
        MilitaryStatus militaryStatus,
        String militaryBranch,
        String militaryRank,
        LocalDate militaryDischargeDate,
        String careerSummary,
        Instant updatedAt
) {

    public static PersonalInfoResponse empty() {
        return new PersonalInfoResponse(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }

    public static PersonalInfoResponse from(PersonalInfo personalInfo) {
        return new PersonalInfoResponse(
                personalInfo.getPhone(),
                personalInfo.getAddress(),
                personalInfo.getSchoolName(),
                personalInfo.getMajor(),
                personalInfo.getDoubleMajor(),
                personalInfo.getMinor(),
                personalInfo.getGraduationStatus(),
                personalInfo.getGraduationDate(),
                personalInfo.getGpa(),
                personalInfo.getGpaScale(),
                personalInfo.getMilitaryStatus(),
                personalInfo.getMilitaryBranch(),
                personalInfo.getMilitaryRank(),
                personalInfo.getMilitaryDischargeDate(),
                personalInfo.getCareerSummary(),
                personalInfo.getUpdatedAt()
        );
    }
}
