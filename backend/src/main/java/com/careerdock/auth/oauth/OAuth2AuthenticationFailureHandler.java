package com.careerdock.auth.oauth;

import com.careerdock.global.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

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
        String redirectUrl = UriComponentsBuilder.fromUri(frontendUrl)
                .path("/login")
                .queryParam("error", "oauth_failed")
                .build()
                .toUriString();
        response.sendRedirect(redirectUrl);
    }
}
