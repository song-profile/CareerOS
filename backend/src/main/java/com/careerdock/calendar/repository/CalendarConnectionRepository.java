package com.careerdock.calendar.repository;

import com.careerdock.calendar.domain.CalendarConnection;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarConnectionRepository extends JpaRepository<CalendarConnection, Long> {

    Optional<CalendarConnection> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
