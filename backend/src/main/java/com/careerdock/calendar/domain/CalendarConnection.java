package com.careerdock.calendar.domain;

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

/**
 * 사용자당 하나의 Google Calendar 연결. 로그인용 Google OAuth와는 별개 scope·별개 토큰이다.
 *
 * user_id에 유니크 제약을 걸어 1:1을 강제한다. {@code @OneToOne}을 쓰지 않는 이유: Hibernate의
 * {@code @OneToOne(LAZY)}는 바이트코드 enhancement 없이는 즉시 로딩으로 동작해 조회할 때마다
 * 이 테이블까지 항상 조인하게 된다. 이 프로젝트엔 그 enhancement 플러그인이 없으므로, 다른
 * 엔티티들처럼 {@code @ManyToOne} + 유니크 컬럼으로 진짜 지연 로딩을 확보한다.
 *
 * 토큰은 항상 암호화된 값만 들고 있는다({@code GoogleTokenCipher}로 암복호화). 이 엔티티도,
 * 어떤 로그에도 평문 토큰이 지나가서는 안 된다.
 */
@Entity
@Table(name = "google_calendar_connections")
public class CalendarConnection extends BaseTimeEntity {

    private static final int MAX_ERROR_LENGTH = 500;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "google_account_email")
    private String googleAccountEmail;

    @Column(name = "refresh_token_encrypted", nullable = false, length = 500)
    private String refreshTokenEncrypted;

    @Column(name = "access_token_encrypted", length = 500)
    private String accessTokenEncrypted;

    @Column(name = "access_token_expires_at")
    private Instant accessTokenExpiresAt;

    @Column(name = "google_calendar_id", length = 200)
    private String googleCalendarId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SyncStatus status;

    @Column(name = "connected_at", nullable = false)
    private Instant connectedAt;

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;

    @Column(name = "last_sync_error", length = MAX_ERROR_LENGTH)
    private String lastSyncError;

    protected CalendarConnection() {
    }

    private CalendarConnection(User user) {
        this.user = user;
        this.connectedAt = Instant.now();
        this.status = SyncStatus.PENDING;
    }

    public static CalendarConnection connect(
            User user,
            String googleAccountEmail,
            String refreshTokenEncrypted,
            String accessTokenEncrypted,
            Instant accessTokenExpiresAt
    ) {
        CalendarConnection connection = new CalendarConnection(user);
        connection.applyGrant(googleAccountEmail, refreshTokenEncrypted, accessTokenEncrypted, accessTokenExpiresAt);
        return connection;
    }

    /** 이미 연결된 사용자가 재동의한 경우. Google 캘린더 id는 유효하면 그대로 재사용한다. */
    public void reconnect(
            String googleAccountEmail,
            String refreshTokenEncrypted,
            String accessTokenEncrypted,
            Instant accessTokenExpiresAt
    ) {
        this.connectedAt = Instant.now();
        this.status = SyncStatus.PENDING;
        this.lastSyncError = null;
        applyGrant(googleAccountEmail, refreshTokenEncrypted, accessTokenEncrypted, accessTokenExpiresAt);
    }

    private void applyGrant(
            String googleAccountEmail,
            String refreshTokenEncrypted,
            String accessTokenEncrypted,
            Instant accessTokenExpiresAt
    ) {
        this.googleAccountEmail = googleAccountEmail;
        this.refreshTokenEncrypted = refreshTokenEncrypted;
        this.accessTokenEncrypted = accessTokenEncrypted;
        this.accessTokenExpiresAt = accessTokenExpiresAt;
    }

    /** Google SDK가 만료된 access token을 자동으로 갱신했을 때 호출된다. 연결 상태는 건드리지 않는다. */
    public void applyRefreshedAccessToken(String accessTokenEncrypted, Instant accessTokenExpiresAt) {
        this.accessTokenEncrypted = accessTokenEncrypted;
        this.accessTokenExpiresAt = accessTokenExpiresAt;
    }

    /** CareerDock 전용 캘린더 준비 완료. 연결 흐름의 마지막 단계이자, 자가치유(재생성) 후에도 쓴다. */
    public void markConnected(String googleCalendarId) {
        this.googleCalendarId = googleCalendarId;
        markSynced();
    }

    /** 개별 이벤트 push든 배치 재시도든, 성공하면 연결 상태를 정상으로 되돌린다. */
    public void markSynced() {
        this.status = SyncStatus.SYNCED;
        this.lastSyncedAt = Instant.now();
        this.lastSyncError = null;
    }

    public void markSyncFailed(String reason) {
        this.status = SyncStatus.FAILED;
        this.lastSyncError = reason == null || reason.length() <= MAX_ERROR_LENGTH
                ? reason
                : reason.substring(0, MAX_ERROR_LENGTH);
    }

    public Long getId() { return id; }

    public User getUser() { return user; }

    public String getGoogleAccountEmail() { return googleAccountEmail; }

    public String getRefreshTokenEncrypted() { return refreshTokenEncrypted; }

    public String getAccessTokenEncrypted() { return accessTokenEncrypted; }

    public Instant getAccessTokenExpiresAt() { return accessTokenExpiresAt; }

    public String getGoogleCalendarId() { return googleCalendarId; }

    public SyncStatus getStatus() { return status; }

    public Instant getConnectedAt() { return connectedAt; }

    public Instant getLastSyncedAt() { return lastSyncedAt; }

    public String getLastSyncError() { return lastSyncError; }
}
