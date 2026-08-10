package com.careerdock.profile.repository;

import com.careerdock.profile.domain.PersonalInfo;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonalInfoRepository extends JpaRepository<PersonalInfo, Long> {

    Optional<PersonalInfo> findByUser_Id(Long userId);
}
