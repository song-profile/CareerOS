package com.careerdock.link.domain;

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

@Entity
@Table(name = "external_links")
public class ExternalLink extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "link_type", nullable = false, length = 40)
    private LinkType linkType;

    @Column(name = "display_name", nullable = false, length = 150)
    private String displayName;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(length = 300)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LinkVisibility visibility;

    @Column(name = "project_name", length = 150)
    private String projectName;

    protected ExternalLink() {
    }

    public static ExternalLink create(
            User user,
            LinkType linkType,
            String displayName,
            String url,
            String description,
            LinkVisibility visibility,
            String projectName
    ) {
        ExternalLink link = new ExternalLink();
        link.user = user;
        link.update(linkType, displayName, url, description, visibility, projectName);
        return link;
    }

    public void update(
            LinkType linkType,
            String displayName,
            String url,
            String description,
            LinkVisibility visibility,
            String projectName
    ) {
        this.linkType = linkType;
        this.displayName = displayName.trim();
        this.url = url.trim();
        this.description = description;
        this.visibility = visibility == null ? LinkVisibility.PRIVATE : visibility;
        this.projectName = projectName;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public LinkType getLinkType() { return linkType; }
    public String getDisplayName() { return displayName; }
    public String getUrl() { return url; }
    public String getDescription() { return description; }
    public LinkVisibility getVisibility() { return visibility; }
    public String getProjectName() { return projectName; }
}
