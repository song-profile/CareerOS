package com.careerdock.file.repository;

import com.careerdock.file.domain.FileAsset;
import com.careerdock.file.domain.FileCategory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileAssetRepository extends JpaRepository<FileAsset, Long> {

    List<FileAsset> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<FileAsset> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, FileCategory category);

    Optional<FileAsset> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);
}
