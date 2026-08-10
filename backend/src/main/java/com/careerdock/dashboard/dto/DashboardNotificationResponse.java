package com.careerdock.dashboard.dto;

import com.careerdock.notification.domain.Notification;
import com.careerdock.notification.domain.NotificationType;
import java.time.Instant;

public record DashboardNotificationResponse(
        Long notificationId,
        NotificationType type,
        String title,
        String message,
        String linkUrl,
        Instant createdAt
) {
    public static DashboardNotificationResponse from(Notification notification) {
        return new DashboardNotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getLinkUrl(),
                notification.getCreatedAt()
        );
    }
}
