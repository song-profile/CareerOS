package com.careerdock.notification.controller;

import com.careerdock.global.auth.CurrentUserAccessor;
import com.careerdock.notification.dto.NotificationResponse;
import com.careerdock.notification.dto.NotificationUnreadCountResponse;
import com.careerdock.notification.service.NotificationService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserAccessor currentUserAccessor;

    public NotificationController(NotificationService notificationService, CurrentUserAccessor currentUserAccessor) {
        this.notificationService = notificationService;
        this.currentUserAccessor = currentUserAccessor;
    }

    @GetMapping
    public List<NotificationResponse> list(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(required = false) Integer limit
    ) {
        return notificationService.findNotifications(currentUserAccessor.getCurrentUserId(), unreadOnly, limit);
    }

    @GetMapping("/unread-count")
    public NotificationUnreadCountResponse unreadCount() {
        return notificationService.unreadCount(currentUserAccessor.getCurrentUserId());
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable Long id) {
        return notificationService.markRead(currentUserAccessor.getCurrentUserId(), id);
    }

    @PatchMapping("/read-all")
    public NotificationUnreadCountResponse markAllRead() {
        return notificationService.markAllRead(currentUserAccessor.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        notificationService.delete(currentUserAccessor.getCurrentUserId(), id);
    }
}
