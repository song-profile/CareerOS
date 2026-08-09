package com.careerdock.notification.service;

import com.careerdock.notification.domain.Notification;
import org.springframework.stereotype.Component;

@Component
public class NoopNotificationEmailSender implements NotificationEmailSender {

    @Override
    public void send(Notification notification) {
        // Email delivery is intentionally deferred. Internal app notifications are the MVP path.
    }
}
