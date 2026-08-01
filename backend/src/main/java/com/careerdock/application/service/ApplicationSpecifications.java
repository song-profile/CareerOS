package com.careerdock.application.service;

import com.careerdock.application.domain.Application;
import com.careerdock.application.dto.ApplicationSearchCondition;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

final class ApplicationSpecifications {

    private ApplicationSpecifications() {
    }

    static Specification<Application> byCondition(Long userId, ApplicationSearchCondition condition) {
        return Specification
                .where(userIdEquals(userId))
                .and(statusEquals(condition))
                .and(companyContains(condition))
                .and(positionContains(condition))
                .and(recruitmentYearEquals(condition))
                .and(seasonEquals(condition))
                .and(keywordContains(condition))
                .and(deadlineBetween(condition));
    }

    private static Specification<Application> userIdEquals(Long userId) {
        return (root, query, builder) -> builder.equal(root.get("user").get("id"), userId);
    }

    private static Specification<Application> statusEquals(ApplicationSearchCondition condition) {
        return (root, query, builder) -> condition.status() == null
                ? builder.conjunction()
                : builder.equal(root.get("status"), condition.status());
    }

    private static Specification<Application> companyContains(ApplicationSearchCondition condition) {
        return (root, query, builder) -> {
            if (isBlank(condition.company())) {
                return builder.conjunction();
            }
            return builder.like(
                    builder.lower(root.join("company", JoinType.INNER).get("name")),
                    contains(condition.company())
            );
        };
    }

    private static Specification<Application> positionContains(ApplicationSearchCondition condition) {
        return (root, query, builder) -> isBlank(condition.position())
                ? builder.conjunction()
                : builder.like(builder.lower(root.get("positionName")), contains(condition.position()));
    }

    private static Specification<Application> recruitmentYearEquals(ApplicationSearchCondition condition) {
        return (root, query, builder) -> condition.recruitmentYear() == null
                ? builder.conjunction()
                : builder.equal(root.get("recruitmentYear"), condition.recruitmentYear());
    }

    private static Specification<Application> seasonEquals(ApplicationSearchCondition condition) {
        return (root, query, builder) -> condition.season() == null
                ? builder.conjunction()
                : builder.equal(root.get("season"), condition.season());
    }

    private static Specification<Application> keywordContains(ApplicationSearchCondition condition) {
        return (root, query, builder) -> {
            if (isBlank(condition.keyword())) {
                return builder.conjunction();
            }
            String keyword = contains(condition.keyword());
            return builder.or(
                    builder.like(builder.lower(root.join("company", JoinType.INNER).get("name")), keyword),
                    builder.like(builder.lower(root.get("positionName")), keyword)
            );
        };
    }

    private static Specification<Application> deadlineBetween(ApplicationSearchCondition condition) {
        return (root, query, builder) -> {
            if (condition.deadlineFrom() != null && condition.deadlineTo() != null) {
                return builder.between(root.get("deadlineAt"), condition.deadlineFrom(), condition.deadlineTo());
            }
            if (condition.deadlineFrom() != null) {
                return builder.greaterThanOrEqualTo(root.get("deadlineAt"), condition.deadlineFrom());
            }
            if (condition.deadlineTo() != null) {
                return builder.lessThanOrEqualTo(root.get("deadlineAt"), condition.deadlineTo());
            }
            return builder.conjunction();
        };
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String contains(String value) {
        return "%" + value.toLowerCase().trim() + "%";
    }
}
