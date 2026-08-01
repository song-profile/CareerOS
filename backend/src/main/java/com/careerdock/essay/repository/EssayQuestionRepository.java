package com.careerdock.essay.repository;

import com.careerdock.essay.domain.EssayQuestion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EssayQuestionRepository extends JpaRepository<EssayQuestion, Long> {

    List<EssayQuestion> findByApplicationIdOrderByQuestionOrderAsc(Long applicationId);

    Optional<EssayQuestion> findByIdAndApplicationUserId(Long id, Long userId);
}
