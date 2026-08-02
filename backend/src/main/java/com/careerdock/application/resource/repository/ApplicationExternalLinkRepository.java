package com.careerdock.application.resource.repository;

import com.careerdock.application.resource.domain.ApplicationExternalLink;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationExternalLinkRepository extends JpaRepository<ApplicationExternalLink, Long> {

    @EntityGraph(attributePaths = "externalLink")
    List<ApplicationExternalLink> findByApplicationIdOrderByLinkedAtDesc(Long applicationId);

    Optional<ApplicationExternalLink> findByApplicationIdAndExternalLinkId(Long applicationId, Long externalLinkId);

    boolean existsByApplicationIdAndExternalLinkId(Long applicationId, Long externalLinkId);

    boolean existsByExternalLinkId(Long externalLinkId);
}
