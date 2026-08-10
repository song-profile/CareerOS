package com.careerdock.notification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.careerdock.notification.domain.Notification;
import com.careerdock.notification.domain.NotificationType;
import com.careerdock.notification.repository.NotificationRepository;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

/** dedupeKey 중복 생성을 막는 두 겹의 안전장치(서비스 선조회 + DB 유니크 제약)를 각각 검증한다. */
@SpringBootTest
@ActiveProfiles("test")
class NotificationServiceTest {

    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private NotificationService notificationService;

    private User owner;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");
        owner = userRepository.save(User.createGoogleUser("notification-owner", "owner@example.com", "본인", null));
    }

    @Test
    void createIfAbsentSkipsWhenSameUserAndDedupeKeyAlreadyExists() {
        boolean firstCreated = notificationService.createIfAbsent(
                owner.getId(), NotificationType.APPLICATION_DEADLINE, "제목", "메시지", "/applications/1",
                "APPLICATION", 1L, "APPLICATION_DEADLINE:1:2026-08-10");
        boolean secondCreated = notificationService.createIfAbsent(
                owner.getId(), NotificationType.APPLICATION_DEADLINE, "다른 제목", "다른 메시지", "/applications/1",
                "APPLICATION", 1L, "APPLICATION_DEADLINE:1:2026-08-10");

        assertThat(firstCreated).isTrue();
        assertThat(secondCreated).isFalse();
        assertThat(notificationRepository.count()).isEqualTo(1);
    }

    @Test
    void createIfAbsentAllowsSameDedupeKeyForDifferentUsers() {
        User otherUser = userRepository.save(User.createGoogleUser("notification-other", "other@example.com", "타인", null));

        boolean ownerCreated = notificationService.createIfAbsent(
                owner.getId(), NotificationType.APPLICATION_DEADLINE, "제목", "메시지", "/applications/1",
                "APPLICATION", 1L, "SHARED-KEY");
        boolean otherCreated = notificationService.createIfAbsent(
                otherUser.getId(), NotificationType.APPLICATION_DEADLINE, "제목", "메시지", "/applications/2",
                "APPLICATION", 2L, "SHARED-KEY");

        assertThat(ownerCreated).isTrue();
        assertThat(otherCreated).isTrue();
        assertThat(notificationRepository.count()).isEqualTo(2);
    }

    /**
     * createIfAbsent의 선조회(existsByUserIdAndDedupeKey)만으로는 동시 요청 사이의 경합을 막지
     * 못한다 — 두 스레드가 동시에 선조회를 통과할 수 있다. 실제 안전장치는 DB의
     * uk_notifications_user_dedupe 유니크 제약이다. 선조회를 우회해 직접 저장함으로써 그 제약이
     * 실제로 걸려 있는지 확인한다.
     */
    @Test
    void databaseUniqueConstraintRejectsDuplicateDedupeKeyEvenWithoutServicePrecheck() {
        notificationRepository.saveAndFlush(Notification.create(
                owner, NotificationType.APPLICATION_DEADLINE, "제목", "메시지", "/applications/1",
                "APPLICATION", 1L, "RACE-KEY"));

        assertThatThrownBy(() -> notificationRepository.saveAndFlush(Notification.create(
                owner, NotificationType.APPLICATION_DEADLINE, "제목2", "메시지2", "/applications/1",
                "APPLICATION", 1L, "RACE-KEY")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
