package com.careerdock.company.domain;

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
        name = "companies",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_companies_user_name", columnNames = {"user_id", "name"})
        }
)
public class Company extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "homepage_url", length = 1000)
    private String homepageUrl;

    @Column(length = 500)
    private String memo;

    protected Company() {
    }

    private Company(User user, String name, String homepageUrl, String memo) {
        this.user = user;
        this.name = name;
        this.homepageUrl = homepageUrl;
        this.memo = memo;
    }

    public static Company create(User user, String name, String homepageUrl, String memo) {
        return new Company(user, name, homepageUrl, memo);
    }

    public void updateOptionalInfo(String homepageUrl, String memo) {
        if (homepageUrl != null) {
            this.homepageUrl = homepageUrl.isBlank() ? null : homepageUrl;
        }
        if (memo != null) {
            this.memo = memo.isBlank() ? null : memo;
        }
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getName() {
        return name;
    }

    public String getHomepageUrl() {
        return homepageUrl;
    }

    public String getMemo() {
        return memo;
    }
}
