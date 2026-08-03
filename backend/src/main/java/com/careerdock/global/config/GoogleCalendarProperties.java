package com.careerdock.global.config;

import java.net.URI;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Google Calendar 연동 전용 설정. 로그인용 OAuth client-id/secret은
 * spring.security.oauth2.client.registration.google.*에서 직접 읽어 재사용하고(같은 Google Cloud
 * OAuth 클라이언트), 여기에는 로그인 흐름과 무관한 값만 둔다.
 */
@ConfigurationProperties(prefix = "app.google.calendar")
public record GoogleCalendarProperties(
        URI redirectUri,
        String tokenEncryptionKey
) {
}
