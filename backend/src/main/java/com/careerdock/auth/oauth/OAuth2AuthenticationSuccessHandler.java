package com.careerdock.auth.oauth;

import com.careerdock.global.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.careerdock.global.auth.CareerdockOAuth2User;
import java.net.URI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final URI frontendUrl;

    public OAuth2AuthenticationSuccessHandler(AppProperties appProperties) {
        this.frontendUrl = appProperties.frontendUrl();
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        // 로그인 성공이 어디까지 갔는지 남긴다. 실패만 찍으면 "리다이렉트는 됐는데
        // 세션이 없다" 같은 신고가 들어왔을 때 대조할 기준이 없다.
        log.info("google 로그인 성공: userId={}, endpoint=/oauth2/authorization/google",
                authentication.getPrincipal() instanceof CareerdockOAuth2User principal
                        ? principal.loginUser().id()
                        : "unknown");

        String redirectUrl = UriComponentsBuilder.fromUri(frontendUrl)
                .path("/dashboard")
                .build()
                .toUriString();
        response.sendRedirect(redirectUrl);
    }
}
