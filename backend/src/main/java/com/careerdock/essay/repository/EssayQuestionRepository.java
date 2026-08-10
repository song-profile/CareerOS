package com.careerdock.essay.repository;

import com.careerdock.dashboard.dto.DashboardApplicationCountProjection;
import com.careerdock.essay.domain.EssayQuestion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EssayQuestionRepository extends JpaRepository<EssayQuestion, Long> {

    List<EssayQuestion> findByApplicationIdOrderByQuestionOrderAsc(Long applicationId);

    Optional<EssayQuestion> findByIdAndApplicationUserId(Long id, Long userId);

    @Query("""
            select q.application.id as applicationId, count(q) as count
            from EssayQuestion q
            where q.application.user.id = :userId
              and q.application.id in :applicationIds
            group by q.application.id
            """)
    List<DashboardApplicationCountProjection> countDashboardQuestionsByApplicationIds(
            Long userId,
            List<Long> applicationIds
    );
}
