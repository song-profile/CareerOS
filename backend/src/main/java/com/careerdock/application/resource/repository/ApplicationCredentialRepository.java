package com.careerdock.application.resource.repository;

import com.careerdock.application.resource.domain.ApplicationCredential;
import com.careerdock.dashboard.dto.DashboardApplicationCountProjection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ApplicationCredentialRepository extends JpaRepository<ApplicationCredential, Long> {

    @EntityGraph(attributePaths = "credential")
    List<ApplicationCredential> findByApplicationIdOrderByLinkedAtDesc(Long applicationId);

    Optional<ApplicationCredential> findByApplicationIdAndCredentialId(Long applicationId, Long credentialId);

    boolean existsByApplicationIdAndCredentialId(Long applicationId, Long credentialId);

    boolean existsByCredentialId(Long credentialId);

    @Query("""
            select c.application.id as applicationId, count(c) as count
            from ApplicationCredential c
            where c.application.user.id = :userId
              and c.application.id in :applicationIds
            group by c.application.id
            """)
    List<DashboardApplicationCountProjection> countDashboardCredentialsByApplicationIds(
            Long userId,
            List<Long> applicationIds
    );
}
