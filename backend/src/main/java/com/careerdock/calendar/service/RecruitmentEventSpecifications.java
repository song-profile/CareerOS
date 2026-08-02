package com.careerdock.calendar.service;

import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.calendar.dto.EventSearchCondition;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

/**
 * 조건별 Specification 조합. 자소서·지원 건 검색과 같은 패턴이다.
 *
 * ":param IS NULL OR ..." 형태의 JPQL은 PostgreSQL이 파라미터 타입을 추론하지 못해
 * "could not determine data type of parameter"로 터진다. 필터가 없을 때 조건 자체를
 * 넣지 않는 Specification은 이 문제가 애초에 생기지 않는다.
 */
final class RecruitmentEventSpecifications {

    private RecruitmentEventSpecifications() {
    }

    static Specification<RecruitmentEvent> byCondition(Long userId, EventSearchCondition condition) {
        return Specification.<RecruitmentEvent>where(fetchApplicationAndCompany())
                .and(userIdEquals(userId))
                .and(overlapsRange(condition))
                .and(applicationIdEquals(condition))
                .and(eventTypeEquals(condition));
    }

    /**
     * 목록에서 회사명·직무명을 함께 내려주므로 fetch join으로 N+1을 막는다.
     * Page의 count 쿼리는 resultType이 Long이라 여기서 걸러 fetch를 넣지 않는다.
     */
    private static Specification<RecruitmentEvent> fetchApplicationAndCompany() {
        return (root, query, builder) -> {
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("application", JoinType.LEFT).fetch("company", JoinType.LEFT);
            }
            return builder.conjunction();
        };
    }

    private static Specification<RecruitmentEvent> userIdEquals(Long userId) {
        return (root, query, builder) -> builder.equal(root.get("user").get("id"), userId);
    }

    /** 겹침 조건. 여러 날짜에 걸친 일정은 걸쳐 있는 모든 범위 조회에 나와야 한다. */
    private static Specification<RecruitmentEvent> overlapsRange(EventSearchCondition condition) {
        return (root, query, builder) -> {
            var predicate = builder.conjunction();
            if (condition.start() != null) {
                predicate = builder.and(predicate, builder.greaterThanOrEqualTo(root.get("endAt"), condition.start()));
            }
            if (condition.end() != null) {
                predicate = builder.and(predicate, builder.lessThanOrEqualTo(root.get("startAt"), condition.end()));
            }
            return predicate;
        };
    }

    private static Specification<RecruitmentEvent> applicationIdEquals(EventSearchCondition condition) {
        return (root, query, builder) -> condition.applicationId() == null
                ? builder.conjunction()
                : builder.equal(root.get("application").get("id"), condition.applicationId());
    }

    private static Specification<RecruitmentEvent> eventTypeEquals(EventSearchCondition condition) {
        return (root, query, builder) -> condition.eventType() == null
                ? builder.conjunction()
                : builder.equal(root.get("eventType"), condition.eventType());
    }
}
