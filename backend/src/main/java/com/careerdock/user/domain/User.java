package com.careerdock.user.domain;

import com.careerdock.global.domain.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_provider_subject", columnNames = {"provider", "provider_user_id"})
        }
)
public class User extends BaseTimeEntity {

    @jakarta.persistence.Id
    @jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuthProvider provider;

    @Column(name = "provider_user_id", nullable = false)
    private String providerUserId;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "profile_image_url", length = 1000)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole role;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    protected User() {
    }

    private User(AuthProvider provider, String providerUserId, String email, String name, String profileImageUrl) {
        this.provider = provider;
        this.providerUserId = providerUserId;
        this.email = email;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
        this.role = UserRole.USER;
        this.lastLoginAt = Instant.now();
    }

    public static User createGoogleUser(String providerUserId, String email, String name, String profileImageUrl) {
        return new User(AuthProvider.GOOGLE, providerUserId, email, name, profileImageUrl);
    }

    public void updateGoogleProfile(String email, String name, String profileImageUrl) {
        this.email = email;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
        this.lastLoginAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public String getProviderUserId() {
        return providerUserId;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public UserRole getRole() {
        return role;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }
}
