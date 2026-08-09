package com.careerdock.notification.service;

import com.careerdock.global.exception.NotFoundException;
import com.careerdock.notification.domain.Notification;
import com.careerdock.notification.domain.NotificationType;
import com.careerdock.notification.dto.NotificationResponse;
import com.careerdock.notification.dto.NotificationUnreadCountResponse;
import com.careerdock.notification.repository.NotificationRepository;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class NotificationService {

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 50;

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationEmailSender emailSender;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            NotificationEmailSender emailSender
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emailSender = emailSender;
    }

    public List<NotificationResponse> findNotifications(Long userId, boolean unreadOnly, Integer limit) {
        int size = resolveLimit(limit);
        return notificationRepository.findByUser(userId, unreadOnly, PageRequest.of(0, size)).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public NotificationUnreadCountResponse unreadCount(Long userId) {
        return new NotificationUnreadCountResponse(notificationRepository.countByUserIdAndReadAtIsNull(userId));
    }

    @Transactional
    public NotificationResponse markRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new NotFoundException("알림을 찾을 수 없습니다."));
        notification.markRead(Instant.now());
        return NotificationResponse.from(notification);
    }

    @Transactional
    public NotificationUnreadCountResponse markAllRead(Long userId) {
        notificationRepository.markAllRead(userId, Instant.now());
        return unreadCount(userId);
    }

    @Transactional
    public void delete(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new NotFoundException("알림을 찾을 수 없습니다."));
        notificationRepository.delete(notification);
    }

    @Transactional
    public boolean createIfAbsent(
            Long userId,
            NotificationType type,
            String title,
            String message,
            String linkUrl,
            String relatedResourceType,
            Long relatedResourceId,
            String dedupeKey
    ) {
        if (notificationRepository.existsByUserIdAndDedupeKey(userId, dedupeKey)) {
            return false;
        }

        User user = userRepository.getReferenceById(userId);
        Notification notification = Notification.create(
                user,
                type,
                title,
                message,
                linkUrl,
                relatedResourceType,
                relatedResourceId,
                dedupeKey
        );

        try {
            notificationRepository.save(notification);
            emailSender.send(notification);
            return true;
        } catch (DataIntegrityViolationException ignored) {
            return false;
        }
    }

    private int resolveLimit(Integer limit) {
        if (limit == null) {
            return DEFAULT_LIMIT;
        }
        if (limit < 1) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limit, MAX_LIMIT);
    }
}
