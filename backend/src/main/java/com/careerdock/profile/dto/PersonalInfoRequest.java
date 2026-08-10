package com.careerdock.profile.dto;

import com.careerdock.profile.domain.GraduationStatus;
import com.careerdock.profile.domain.MilitaryStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PersonalInfoRequest(
        @Size(max = 30, message = "전화번호는 30자 이하여야 합니다.")
        @Pattern(regexp = "^$|^[0-9+()\\-\\s]{0,30}$", message = "전화번호 형식을 확인해 주세요.")
        String phone,

        @Size(max = 300, message = "주소는 300자 이하여야 합니다.")
        String address,

        @Size(max = 150, message = "학교명은 150자 이하여야 합니다.")
        String schoolName,

        @Size(max = 150, message = "전공은 150자 이하여야 합니다.")
        String major,

        @Size(max = 150, message = "복수전공은 150자 이하여야 합니다.")
        String doubleMajor,

        @Size(max = 150, message = "부전공은 150자 이하여야 합니다.")
        String minor,

        GraduationStatus graduationStatus,
        LocalDate graduationDate,

        @DecimalMin(value = "0.0", message = "학점은 0 이상이어야 합니다.")
        @DecimalMax(value = "5.0", message = "학점은 5.0 이하여야 합니다.")
        BigDecimal gpa,

        @DecimalMin(value = "0.1", message = "학점 만점은 0보다 커야 합니다.")
        @DecimalMax(value = "5.0", message = "학점 만점은 5.0 이하여야 합니다.")
        BigDecimal gpaScale,

        MilitaryStatus militaryStatus,

        @Size(max = 50, message = "군별은 50자 이하여야 합니다.")
        String militaryBranch,

        @Size(max = 50, message = "계급은 50자 이하여야 합니다.")
        String militaryRank,

        LocalDate militaryDischargeDate,

        @Size(max = 1000, message = "경력요약은 1000자 이하여야 합니다.")
        String careerSummary
) {

    @AssertTrue(message = "학점은 학점 만점보다 클 수 없습니다.")
    public boolean isGpaWithinScale() {
        return gpa == null || gpaScale == null || gpa.compareTo(gpaScale) <= 0;
    }
}
