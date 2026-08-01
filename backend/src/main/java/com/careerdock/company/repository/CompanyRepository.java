package com.careerdock.company.repository;

import com.careerdock.company.domain.Company;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByUserIdAndName(Long userId, String name);
}
