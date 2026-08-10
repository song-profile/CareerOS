package com.careerdock.essay.repository;

import com.careerdock.dashboard.dto.DashboardApplicationCountProjection;
import com.careerdock.essay.domain.EssayAnswer;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EssayAnswerRepository extends JpaRepository<EssayAnswer, Long>, JpaSpecificationExecutor<EssayAnswer> {

    Optional<EssayAnswer> findByIdAndUserId(Long id, Long userId);

    List<EssayAnswer> findByQuestionIdAndUserIdOrderByVersionDesc(Long questionId, Long userId);

    @Query("select coalesce(max(a.version), 0) from EssayAnswer a where a.question.id = :questionId")
    int findMaxVersionByQuestionId(@Param("questionId") Long questionId);

    @Query("""
            select a.question.application.id as applicationId, count(distinct a.question.id) as count
            from EssayAnswer a
            where a.user.id = :userId
              and a.question.application.id in :applicationIds
            group by a.question.application.id
            """)
    List<DashboardApplicationCountProjection> countDashboardAnsweredQuestionsByApplicationIds(
            Long userId,
            List<Long> applicationIds
    );
}
