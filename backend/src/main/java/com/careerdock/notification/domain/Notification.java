package com.careerdock.notification.domain;

import com.careerdock.global.domain.BaseTimeEntity;
import com.careerdock.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 40)
    private NotificationType type;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "related_resource_type", length = 50)
    private String relatedResourceType;

    @Column(name = "related_resource_id")
    private Long relatedResourceId;

    @Column(name = "dedupe_key", nullable = false, length = 180)
    private String dedupeKey;

    @Column(name = "read_at")
    private Instant readAt;

    protected Notification() {
    }

    private Notification(
            User user,
            NotificationType type,
            String title,
            String message,
            String linkUrl,
            String relatedResourceType,
            Long relatedResourceId,
            String dedupeKey
    ) {
        this.user = user;
        this.type = type;
        this.title = title;
        this.message = message;
        this.linkUrl = linkUrl;
        this.relatedResourceType = relatedResourceType;
        this.relatedResourceId = relatedResourceId;
        this.dedupeKey = dedupeKey;
    }

    public static Notification create(
            User user,
            NotificationType type,
            String title,
            String message,
            String linkUrl,
            String relatedResourceType,
            Long relatedResourceId,
            String dedupeKey
    ) {
        return new Notification(user, type, title, message, linkUrl, relatedResourceType, relatedResourceId, dedupeKey);
    }

    public void markRead(Instant readAt) {
        if (this.readAt == null) {
            this.readAt = readAt;
        }
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public NotificationType getType() { return type; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getLinkUrl() { return linkUrl; }
    public String getRelatedResourceType() { return relatedResourceType; }
    public Long getRelatedResourceId() { return relatedResourceId; }
    public String getDedupeKey() { return dedupeKey; }
    public Instant getReadAt() { return readAt; }
    public boolean isRead() { return readAt != null; }
}
