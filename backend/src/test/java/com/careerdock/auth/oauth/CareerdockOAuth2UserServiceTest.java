package com.careerdock.auth.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.user.domain.User;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistration.Builder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

@ExtendWith(MockitoExtension.class)
class CareerdockOAuth2UserServiceTest {

    @Mock
    private OAuthUserProvisioner userProvisioner;

    @Test
    void loadUserReturnsCareerdockPrincipalAfterProvisioningGoogleUser() {
        OAuth2User googleUser = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of(
                        "sub", "google-subject",
                        "email", "user@example.com",
                        "name", "사용자",
                        "picture", "https://example.com/profile.png"
                ),
                "sub"
        );
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = request -> googleUser;
        CareerdockOAuth2UserService service = new CareerdockOAuth2UserService(delegate, userProvisioner);
        User user = User.createGoogleUser(
                "google-subject",
                "user@example.com",
                "사용자",
                "https://example.com/profile.png"
        );
        when(userProvisioner.provisionGoogleUser(new GoogleOAuthAttributes(
                "google-subject",
                "user@example.com",
                "사용자",
                "https://example.com/profile.png"
        ))).thenReturn(user);

        OAuth2User principal = service.loadUser(userRequest());

        assertThat(principal).isInstanceOf(CareerdockOAuth2User.class);
        CareerdockOAuth2User careerdockPrincipal = (CareerdockOAuth2User) principal;
        assertThat(careerdockPrincipal.loginUser().email()).isEqualTo("user@example.com");
        assertThat(careerdockPrincipal.loginUser().name()).isEqualTo("사용자");
        assertThat(careerdockPrincipal.getName()).isEqualTo("google-subject");
    }

    private OAuth2UserRequest userRequest() {
        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                "access-token",
                null,
                null,
                Set.of("profile", "email")
        );
        return new OAuth2UserRequest(googleRegistration(), accessToken);
    }

    private ClientRegistration googleRegistration() {
        Builder builder = ClientRegistration.withRegistrationId("google")
                .clientId("google-client-id")
                .clientSecret("google-client-secret")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .userInfoUri("https://openidconnect.googleapis.com/v1/userinfo")
                .userNameAttributeName("sub")
                .scope("profile", "email")
                .clientName("Google");
        return builder.build();
    }
}
