package com.careerdock.notification.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.notification.domain.NotificationType;
import com.careerdock.notification.service.NotificationService;
import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificationControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;

    private User owner;
    private User otherUser;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");

        owner = userRepository.save(User.createGoogleUser("notification-owner", "owner@example.com", "본인", null));
        otherUser = userRepository.save(User.createGoogleUser("notification-other", "other@example.com", "타인", null));
    }

    @Test
    void listRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void returnsOnlyLoggedInUsersNotifications() throws Exception {
        create(owner, "본인 알림", "owner-1");
        create(otherUser, "타인 알림", "other-1");

        mockMvc.perform(get("/api/notifications").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("본인 알림"));
    }

    @Test
    void marksReadAndCountsUnread() throws Exception {
        long notificationId = create(owner, "읽을 알림", "read-1");

        mockMvc.perform(get("/api/notifications/unread-count").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(1));

        mockMvc.perform(patch("/api/notifications/{id}/read", notificationId).with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.read").value(true))
                .andExpect(jsonPath("$.readAt").exists());

        mockMvc.perform(get("/api/notifications/unread-count").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(0));
    }

    @Test
    void marksAllReadAndFiltersUnreadOnly() throws Exception {
        create(owner, "알림 1", "all-1");
        create(owner, "알림 2", "all-2");

        mockMvc.perform(patch("/api/notifications/read-all").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(0));

        mockMvc.perform(get("/api/notifications")
                        .param("unreadOnly", "true")
                        .with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void deletesOnlyOwnNotification() throws Exception {
        long notificationId = create(owner, "삭제 대상", "delete-1");

        mockMvc.perform(delete("/api/notifications/{id}", notificationId).with(authentication(auth(otherUser))))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/notifications/{id}", notificationId).with(authentication(auth(owner))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/notifications").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    private long create(User user, String title, String dedupeKey) {
        notificationService.createIfAbsent(
                user.getId(),
                NotificationType.SYSTEM,
                title,
                "메시지",
                "/dashboard",
                "SYSTEM",
                null,
                dedupeKey
        );
        Number id = jdbcTemplate.queryForObject(
                "SELECT id FROM notifications WHERE user_id = ? AND dedupe_key = ?",
                Number.class,
                user.getId(),
                dedupeKey
        );
        return id.longValue();
    }

    private Authentication auth(User user) {
        LoginUser loginUser = new LoginUser(user.getId(), user.getEmail(), user.getName(), null, AuthProvider.GOOGLE);
        CareerdockOAuth2User principal = new CareerdockOAuth2User(
                loginUser,
                Map.of("sub", user.getProviderUserId()),
                List.of(),
                "sub"
        );
        return new TestingAuthenticationToken(principal, null, "ROLE_USER");
    }
}
