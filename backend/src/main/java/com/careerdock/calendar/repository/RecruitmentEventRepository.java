package com.careerdock.calendar.repository;

import com.careerdock.calendar.domain.RecruitmentEvent;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RecruitmentEventRepository
        extends JpaRepository<RecruitmentEvent, Long>, JpaSpecificationExecutor<RecruitmentEvent> {

    @EntityGraph(attributePaths = {"application", "application.company"})
    Optional<RecruitmentEvent> findByIdAndUserId(Long id, Long userId);
}
