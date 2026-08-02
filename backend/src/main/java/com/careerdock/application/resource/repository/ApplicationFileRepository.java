package com.careerdock.application.resource.repository;

import com.careerdock.application.resource.domain.ApplicationFile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationFileRepository extends JpaRepository<ApplicationFile, Long> {

    @EntityGraph(attributePaths = "fileAsset")
    List<ApplicationFile> findByApplicationIdOrderByLinkedAtDesc(Long applicationId);

    Optional<ApplicationFile> findByApplicationIdAndFileAssetId(Long applicationId, Long fileAssetId);

    boolean existsByApplicationIdAndFileAssetId(Long applicationId, Long fileAssetId);

    /** 다른 지원 건에서라도 아직 연결돼 있으면 파일 원본 삭제를 막는 데 쓴다. */
    boolean existsByFileAssetId(Long fileAssetId);
}
