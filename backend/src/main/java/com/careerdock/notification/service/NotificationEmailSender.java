package com.careerdock.notification.service;

import com.careerdock.notification.domain.Notification;

public interface NotificationEmailSender {

    void send(Notification notification);
}
