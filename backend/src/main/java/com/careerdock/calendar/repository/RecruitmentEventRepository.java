package com.careerdock.calendar.repository;

import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.calendar.domain.SyncStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface RecruitmentEventRepository
        extends JpaRepository<RecruitmentEvent, Long>, JpaSpecificationExecutor<RecruitmentEvent> {

    @EntityGraph(attributePaths = {"application", "application.company"})
    Optional<RecruitmentEvent> findByIdAndUserId(Long id, Long userId);

    /** 동기화 재시도 대상. pageable로 한 번에 재시도할 최대 건수를 제한한다. */
    List<RecruitmentEvent> findByUserIdAndSyncStatusIn(Long userId, List<SyncStatus> syncStatuses, Pageable pageable);

    @Query("select e.syncStatus from RecruitmentEvent e where e.user.id = :userId")
    List<SyncStatus> findSyncStatusesByUserId(Long userId);
}
