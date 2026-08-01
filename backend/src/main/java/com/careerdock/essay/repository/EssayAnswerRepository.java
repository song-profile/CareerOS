package com.careerdock.essay.repository;

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
}
