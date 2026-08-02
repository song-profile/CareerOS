package com.careerdock.credential.repository;

import com.careerdock.credential.domain.CredentialAccessAudit;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CredentialAccessAuditRepository extends JpaRepository<CredentialAccessAudit, Long> {

    List<CredentialAccessAudit> findByCredentialIdOrderByAccessedAtDesc(Long credentialId);
}
