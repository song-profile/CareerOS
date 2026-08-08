package com.careerdock.application.repository;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface ApplicationRepository extends JpaRepository<Application, Long>, JpaSpecificationExecutor<Application> {

    Optional<Application> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndStatus(Long userId, ApplicationStatus status);

    @Query("""
            select count(a)
            from Application a
            where a.user.id = :userId
              and a.deadlineAt >= :from
              and a.deadlineAt <= :to
              and a.status not in :excludedStatuses
            """)
    long countDashboardDeadlinesBetween(
            Long userId,
            Instant from,
            Instant to,
            List<ApplicationStatus> excludedStatuses
    );

    @EntityGraph(attributePaths = "company")
    @Query("""
            select a
            from Application a
            where a.user.id = :userId
              and a.deadlineAt >= :from
              and a.status not in :excludedStatuses
            order by a.deadlineAt asc, a.id asc
            """)
    List<Application> findDashboardUpcomingDeadlines(
            Long userId,
            Instant from,
            List<ApplicationStatus> excludedStatuses,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "company")
    @Query("""
            select a
            from Application a
            where a.deadlineAt >= :from
              and a.deadlineAt < :to
              and a.status not in :excludedStatuses
            order by a.deadlineAt asc, a.id asc
            """)
    List<Application> findNotificationDeadlineTargets(
            Instant from,
            Instant to,
            List<ApplicationStatus> excludedStatuses
    );
}
