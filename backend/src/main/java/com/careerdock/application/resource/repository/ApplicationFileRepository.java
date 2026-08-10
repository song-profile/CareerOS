package com.careerdock.application.resource.repository;

import com.careerdock.application.resource.domain.ApplicationFile;
import com.careerdock.dashboard.dto.DashboardApplicationCountProjection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ApplicationFileRepository extends JpaRepository<ApplicationFile, Long> {

    @EntityGraph(attributePaths = "fileAsset")
    List<ApplicationFile> findByApplicationIdOrderByLinkedAtDesc(Long applicationId);

    Optional<ApplicationFile> findByApplicationIdAndFileAssetId(Long applicationId, Long fileAssetId);

    boolean existsByApplicationIdAndFileAssetId(Long applicationId, Long fileAssetId);

    /** 다른 지원 건에서라도 아직 연결돼 있으면 파일 원본 삭제를 막는 데 쓴다. */
    boolean existsByFileAssetId(Long fileAssetId);

    @Query("""
            select f.application.id as applicationId, count(f) as count
            from ApplicationFile f
            where f.application.user.id = :userId
              and f.application.id in :applicationIds
            group by f.application.id
            """)
    List<DashboardApplicationCountProjection> countDashboardFilesByApplicationIds(
            Long userId,
            List<Long> applicationIds
    );
}
