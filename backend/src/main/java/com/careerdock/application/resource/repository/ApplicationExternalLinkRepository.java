package com.careerdock.application.resource.repository;

import com.careerdock.application.resource.domain.ApplicationExternalLink;
import com.careerdock.dashboard.dto.DashboardApplicationCountProjection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ApplicationExternalLinkRepository extends JpaRepository<ApplicationExternalLink, Long> {

    @EntityGraph(attributePaths = "externalLink")
    List<ApplicationExternalLink> findByApplicationIdOrderByLinkedAtDesc(Long applicationId);

    Optional<ApplicationExternalLink> findByApplicationIdAndExternalLinkId(Long applicationId, Long externalLinkId);

    boolean existsByApplicationIdAndExternalLinkId(Long applicationId, Long externalLinkId);

    boolean existsByExternalLinkId(Long externalLinkId);

    @Query("""
            select l.application.id as applicationId, count(l) as count
            from ApplicationExternalLink l
            where l.application.user.id = :userId
              and l.application.id in :applicationIds
            group by l.application.id
            """)
    List<DashboardApplicationCountProjection> countDashboardExternalLinksByApplicationIds(
            Long userId,
            List<Long> applicationIds
    );
}
