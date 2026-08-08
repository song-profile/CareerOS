package com.careerdock.notification.dto;

import com.careerdock.notification.domain.Notification;
import com.careerdock.notification.domain.NotificationType;
import java.time.Instant;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        String linkUrl,
        String relatedResourceType,
        Long relatedResourceId,
        boolean read,
        Instant readAt,
        Instant createdAt
) {

    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getLinkUrl(),
                notification.getRelatedResourceType(),
                notification.getRelatedResourceId(),
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}
