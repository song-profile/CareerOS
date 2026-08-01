package com.careerdock.essay.repository;

import com.careerdock.essay.domain.ExperienceTag;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExperienceTagRepository extends JpaRepository<ExperienceTag, Long> {

    List<ExperienceTag> findByUserIdOrderByNameAsc(Long userId);

    Optional<ExperienceTag> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndName(Long userId, String name);
}
