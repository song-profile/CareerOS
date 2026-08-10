package com.careerdock.file.repository;

import com.careerdock.file.domain.FileAsset;
import com.careerdock.file.domain.FileCategory;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FileAssetRepository extends JpaRepository<FileAsset, Long> {

    List<FileAsset> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<FileAsset> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, FileCategory category);

    Optional<FileAsset> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    boolean existsByParentAssetId(Long parentAssetId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select f from FileAsset f where f.id = :id and f.user.id = :userId")
    Optional<FileAsset> findByIdAndUserIdForUpdate(@Param("id") Long id, @Param("userId") Long userId);

    @Query("""
            select f
            from FileAsset f
            where f.user.id = :userId
              and (f.id = :rootAssetId or f.parentAssetId = :rootAssetId)
            order by f.version desc
            """)
    List<FileAsset> findVersions(
            @Param("userId") Long userId,
            @Param("rootAssetId") Long rootAssetId
    );

    @Query("""
            select coalesce(max(f.version), 0)
            from FileAsset f
            where f.user.id = :userId
              and (f.id = :rootAssetId or f.parentAssetId = :rootAssetId)
            """)
    int findMaxVersion(
            @Param("userId") Long userId,
            @Param("rootAssetId") Long rootAssetId
    );
}
