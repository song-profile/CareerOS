package com.careerdock.calendar.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.careerdock.global.config.GoogleCalendarProperties;
import com.google.api.client.auth.oauth2.Credential;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class GoogleOAuthServiceTest {

    private final GoogleCalendarProperties properties = new GoogleCalendarProperties(
            URI.create("http://localhost:8080/api/calendar/oauth/callback"),
            "Y2FyZWVyZG9jay1sb2NhbC10b2tlbi1rZXktMzJieXg="
    );
    private final GoogleOAuthService service = new GoogleOAuthService("test-client-id", "test-client-secret", properties);

    @Test
    void buildsAuthorizationUrlWithCalendarScopeAndForcedReconsent() {
        String url = service.buildAuthorizationUrl("csrf-state-value");
        String decoded = URLDecoder.decode(url, StandardCharsets.UTF_8);

        assertThat(decoded).startsWith("https://accounts.google.com/o/oauth2/auth");
        assertThat(decoded).contains("client_id=test-client-id");
        assertThat(decoded).contains("redirect_uri=http://localhost:8080/api/calendar/oauth/callback");
        assertThat(decoded).contains("scope=https://www.googleapis.com/auth/calendar");
        // 이미 로그인/다른 scope에 동의한 사용자도 Calendar는 매번 재동의하고 refresh token을
        // 다시 받아야 한다는 요구사항의 핵심 파라미터.
        assertThat(decoded).contains("access_type=offline");
        assertThat(decoded).contains("prompt=consent");
        assertThat(decoded).contains("state=csrf-state-value");
    }

    @Test
    void buildsCredentialCarryingStoredTokens() {
        Instant expiresAt = Instant.now().plusSeconds(3600);

        Credential credential = service.buildCredential("access-token-value", "refresh-token-value", expiresAt, null);

        assertThat(credential.getAccessToken()).isEqualTo("access-token-value");
        assertThat(credential.getRefreshToken()).isEqualTo("refresh-token-value");
        assertThat(credential.getExpiresInSeconds()).isPositive();
    }

    @Test
    void buildsCredentialWithoutExpiryWhenNotProvided() {
        Credential credential = service.buildCredential("access-token-value", "refresh-token-value", null, null);

        assertThat(credential.getExpiresInSeconds()).isNull();
    }
}
