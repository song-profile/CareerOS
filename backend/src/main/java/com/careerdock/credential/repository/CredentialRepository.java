package com.careerdock.credential.repository;

import com.careerdock.credential.domain.Credential;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CredentialRepository extends JpaRepository<Credential, Long> {

    List<Credential> findByUserIdOrderByAcquiredAtDesc(Long userId);

    Optional<Credential> findByIdAndUserId(Long id, Long userId);

    boolean existsByFileAssetId(Long fileAssetId);

    @Query("""
            select c
            from Credential c
            where c.permanent = false
              and c.expiresAt in :targetDates
            order by c.expiresAt asc, c.id asc
            """)
    List<Credential> findNotificationExpirationTargets(List<LocalDate> targetDates);
}
