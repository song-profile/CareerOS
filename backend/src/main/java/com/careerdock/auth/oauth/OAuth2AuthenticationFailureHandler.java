package com.careerdock.auth.oauth;

import com.careerdock.global.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationFailureHandler.class);

    private final URI frontendUrl;

    public OAuth2AuthenticationFailureHandler(AppProperties appProperties) {
        this.frontendUrl = appProperties.frontendUrl();
    }

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {
        // 프론트에는 error=oauth_failed 하나만 나가므로, 실제 사유는 여기서만 남는다.
        // OAuth2Error의 code/description은 Google이 준 사유일 뿐 토큰이 아니다.
        log.warn("google 로그인 실패: endpoint={}, reason={}, cause={}",
                request.getRequestURI(),
                exception instanceof OAuth2AuthenticationException oauthException
                        ? oauthException.getError().getErrorCode()
                        : "authentication_failed",
                exception.getClass().getSimpleName());

        String redirectUrl = UriComponentsBuilder.fromUri(frontendUrl)
                .path("/login")
                .queryParam("error", "oauth_failed")
                .build()
                .toUriString();
        response.sendRedirect(redirectUrl);
    }
}
