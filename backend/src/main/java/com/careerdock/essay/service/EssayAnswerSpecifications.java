package com.careerdock.essay.service;

import com.careerdock.essay.domain.EssayAnswer;
import com.careerdock.essay.dto.EssaySearchCondition;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

final class EssayAnswerSpecifications {

    private EssayAnswerSpecifications() {
    }

    static Specification<EssayAnswer> byCondition(Long userId, EssaySearchCondition condition) {
        return Specification.where(userIdEquals(userId))
                .and(companyContains(condition))
                .and(positionContains(condition))
                .and(commonTypeEquals(condition))
                .and(answerStatusEquals(condition))
                .and(recruitmentYearEquals(condition))
                .and(keywordContains(condition))
                .and(experienceTagEquals(condition));
    }

    private static Specification<EssayAnswer> userIdEquals(Long userId) {
        return (root, query, builder) -> builder.equal(root.get("user").get("id"), userId);
    }

    private static Specification<EssayAnswer> companyContains(EssaySearchCondition condition) {
        return (root, query, builder) -> isBlank(condition.company()) ? builder.conjunction()
                : builder.like(builder.lower(root.join("question").join("application").join("company").get("name")), contains(condition.company()));
    }

    private static Specification<EssayAnswer> positionContains(EssaySearchCondition condition) {
        return (root, query, builder) -> isBlank(condition.position()) ? builder.conjunction()
                : builder.like(builder.lower(root.join("question").join("application").get("positionName")), contains(condition.position()));
    }

    private static Specification<EssayAnswer> commonTypeEquals(EssaySearchCondition condition) {
        return (root, query, builder) -> condition.commonType() == null ? builder.conjunction()
                : builder.equal(root.join("question").get("commonQuestionType"), condition.commonType());
    }

    private static Specification<EssayAnswer> answerStatusEquals(EssaySearchCondition condition) {
        return (root, query, builder) -> condition.answerStatus() == null ? builder.conjunction()
                : builder.equal(root.get("status"), condition.answerStatus());
    }

    private static Specification<EssayAnswer> recruitmentYearEquals(EssaySearchCondition condition) {
        return (root, query, builder) -> condition.recruitmentYear() == null ? builder.conjunction()
                : builder.equal(root.join("question").join("application").get("recruitmentYear"), condition.recruitmentYear());
    }

    private static Specification<EssayAnswer> keywordContains(EssaySearchCondition condition) {
        return (root, query, builder) -> {
            if (isBlank(condition.keyword())) {
                return builder.conjunction();
            }
            String keyword = contains(condition.keyword());
            return builder.or(
                    builder.like(builder.lower(root.get("content")), keyword),
                    builder.like(builder.lower(root.join("question").get("questionText")), keyword),
                    builder.like(builder.lower(root.join("question").join("application").join("company").get("name")), keyword),
                    builder.like(builder.lower(root.join("question").join("application").get("positionName")), keyword)
            );
        };
    }

    private static Specification<EssayAnswer> experienceTagEquals(EssaySearchCondition condition) {
        return (root, query, builder) -> {
            if (condition.experienceTag() == null) {
                return builder.conjunction();
            }
            if (query != null) {
                query.distinct(true);
            }
            return builder.equal(root.join("tags", JoinType.INNER).join("tag").get("id"), condition.experienceTag());
        };
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String contains(String value) {
        return "%" + value.toLowerCase().trim() + "%";
    }
}
