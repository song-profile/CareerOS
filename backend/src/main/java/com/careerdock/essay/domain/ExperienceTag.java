package com.careerdock.essay.domain;

import com.careerdock.global.domain.BaseTimeEntity;
import com.careerdock.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "experience_tags",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_experience_tags_user_name", columnNames = {"user_id", "name"})
        }
)
public class ExperienceTag extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    protected ExperienceTag() {
    }

    private ExperienceTag(User user, String name, String description) {
        this.user = user;
        this.name = name.trim();
        this.description = description == null || description.isBlank() ? null : description;
    }

    public static ExperienceTag create(User user, String name, String description) {
        return new ExperienceTag(user, name, description);
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getName() { return name; }
    public String getDescription() { return description; }
}
