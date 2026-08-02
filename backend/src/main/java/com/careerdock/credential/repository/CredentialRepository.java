package com.careerdock.credential.repository;

import com.careerdock.credential.domain.Credential;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CredentialRepository extends JpaRepository<Credential, Long> {

    List<Credential> findByUserIdOrderByAcquiredAtDesc(Long userId);

    Optional<Credential> findByIdAndUserId(Long id, Long userId);
}
