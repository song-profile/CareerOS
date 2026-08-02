package com.careerdock.application.resource.repository;

import com.careerdock.application.resource.domain.ApplicationCredential;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationCredentialRepository extends JpaRepository<ApplicationCredential, Long> {

    @EntityGraph(attributePaths = "credential")
    List<ApplicationCredential> findByApplicationIdOrderByLinkedAtDesc(Long applicationId);

    Optional<ApplicationCredential> findByApplicationIdAndCredentialId(Long applicationId, Long credentialId);

    boolean existsByApplicationIdAndCredentialId(Long applicationId, Long credentialId);

    boolean existsByCredentialId(Long credentialId);
}
