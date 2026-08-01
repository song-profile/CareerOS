package com.careerdock.essay.repository;

import com.careerdock.essay.domain.EssayAnswerTag;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EssayAnswerTagRepository extends JpaRepository<EssayAnswerTag, Long> {

    boolean existsByAnswerIdAndTagId(Long answerId, Long tagId);

    void deleteByAnswerIdAndTagId(Long answerId, Long tagId);

    List<EssayAnswerTag> findByAnswerId(Long answerId);
}
