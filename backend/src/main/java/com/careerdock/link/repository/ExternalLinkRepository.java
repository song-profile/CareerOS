package com.careerdock.link.repository;

import com.careerdock.link.domain.ExternalLink;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExternalLinkRepository extends JpaRepository<ExternalLink, Long> {

    List<ExternalLink> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ExternalLink> findByIdAndUserId(Long id, Long userId);
}
