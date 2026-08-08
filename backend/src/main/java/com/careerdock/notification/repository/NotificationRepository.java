package com.careerdock.notification.repository;

import com.careerdock.notification.domain.Notification;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    boolean existsByUserIdAndDedupeKey(Long userId, String dedupeKey);

    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    @Query("""
            select n
            from Notification n
            where n.user.id = :userId
              and (:unreadOnly = false or n.readAt is null)
            order by n.createdAt desc, n.id desc
            """)
    List<Notification> findByUser(Long userId, boolean unreadOnly, Pageable pageable);

    long countByUserIdAndReadAtIsNull(Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Notification n
            set n.readAt = :readAt
            where n.user.id = :userId
              and n.readAt is null
            """)
    int markAllRead(Long userId, Instant readAt);
}
