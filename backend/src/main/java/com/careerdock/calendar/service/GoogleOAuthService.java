package com.careerdock.calendar.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.CredentialRefreshListener;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeRequestUrl;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.CalendarScopes;
import com.careerdock.global.config.GoogleCalendarProperties;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Google Calendar 전용 OAuth 처리. 로그인용 {@code oauth2Login}과는 완전히 분리된 흐름이다 —
 * 같은 Google Cloud OAuth 클라이언트(client-id/secret)를 재사용하되, scope와 redirect URI는
 * Calendar 전용으로 별도로 쓴다.
 *
 * 이 클래스는 Google과의 통신만 담당한다. 토큰을 어떻게 저장하고 실패를 어떻게 처리할지는
 * 호출하는 쪽({@link GoogleCalendarSyncService})의 책임이다.
 */
@Component
public class GoogleOAuthService {

    private static final String REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";

    private final String clientId;
    private final String clientSecret;
    private final GoogleCalendarProperties properties;
    private final HttpTransport httpTransport = new NetHttpTransport();
    private final JsonFactory jsonFactory = GsonFactory.getDefaultInstance();
    private final RestClient restClient = RestClient.create();

    public GoogleOAuthService(
            @Value("${spring.security.oauth2.client.registration.google.client-id}") String clientId,
            @Value("${spring.security.oauth2.client.registration.google.client-secret}") String clientSecret,
            GoogleCalendarProperties properties
    ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.properties = properties;
    }

    /**
     * 인가 URL. access_type=offline + prompt=consent로, 이미 로그인/다른 scope에 동의한
     * 사용자라도 Calendar 권한은 매번 새로 동의하고 refresh token을 다시 발급받게 강제한다.
     */
    public String buildAuthorizationUrl(String state) {
        return new GoogleAuthorizationCodeRequestUrl(
                clientId,
                properties.redirectUri().toString(),
                List.of(CalendarScopes.CALENDAR)
        )
                .setAccessType("offline")
                .setState(state)
                .set("prompt", "consent")
                .toString();
    }

    public GoogleTokenResponse exchangeCode(String code) throws IOException {
        return new GoogleAuthorizationCodeTokenRequest(
                httpTransport,
                jsonFactory,
                clientId,
                clientSecret,
                code,
                properties.redirectUri().toString()
        ).execute();
    }

    /**
     * 저장된 토큰으로 요청마다 새로 만드는 Credential. 만료 시 자동 갱신되고, 갱신 결과는
     * refreshListener로 넘어간다(호출자가 암호화해 DB에 반영).
     *
     * GoogleCredential은 deprecated지만, google-auth-library를 새로 추가하지 않고도 저장된
     * 토큰으로 즉석 Credential을 만드는 용도로는 충분하고 가볍다.
     */
    @SuppressWarnings("deprecation")
    public Credential buildCredential(
            String accessToken,
            String refreshToken,
            Instant accessTokenExpiresAt,
            CredentialRefreshListener refreshListener
    ) {
        GoogleCredential.Builder builder = new GoogleCredential.Builder()
                .setTransport(httpTransport)
                .setJsonFactory(jsonFactory)
                .setClientSecrets(clientId, clientSecret);
        if (refreshListener != null) {
            builder.addRefreshListener(refreshListener);
        }
        GoogleCredential credential = builder.build();
        credential.setAccessToken(accessToken);
        credential.setRefreshToken(refreshToken);
        if (accessTokenExpiresAt != null) {
            credential.setExpirationTimeMilliseconds(accessTokenExpiresAt.toEpochMilli());
        }
        return credential;
    }

    /** 연결 해제 시 최선 노력으로 토큰을 무효화한다. 실패해도 로컬 연결 해제는 계속 진행한다. */
    public void revoke(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        try {
            restClient.post()
                    .uri(REVOKE_ENDPOINT + "?token={token}", refreshToken)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException exception) {
            // best-effort. Google 쪽 revoke가 실패해도 로컬 연결 해제를 막지 않는다.
        }
    }
}
