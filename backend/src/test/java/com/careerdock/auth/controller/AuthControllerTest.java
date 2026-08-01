package com.careerdock.auth.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.auth.oauth.CareerdockOAuth2UserService;
import com.careerdock.auth.oauth.OAuth2AuthenticationFailureHandler;
import com.careerdock.auth.oauth.OAuth2AuthenticationSuccessHandler;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.global.security.RestAccessDeniedHandler;
import com.careerdock.global.security.RestAuthenticationEntryPoint;
import com.careerdock.global.security.SecurityConfig;
import com.careerdock.user.domain.AuthProvider;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@Import({
        SecurityConfig.class,
        RestAuthenticationEntryPoint.class,
        RestAccessDeniedHandler.class
})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CareerdockOAuth2UserService oauth2UserService;

    @MockBean
    private OAuth2AuthenticationSuccessHandler successHandler;

    @MockBean
    private OAuth2AuthenticationFailureHandler failureHandler;

    @MockBean
    private ClientRegistrationRepository clientRegistrationRepository;

    @MockBean
    private OAuth2AuthorizedClientRepository authorizedClientRepository;

    @Test
    void meRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void meReturnsAuthenticatedCurrentUser() throws Exception {
        CareerdockOAuth2User principal = principal();

        mockMvc.perform(get("/api/auth/me").with(authentication(authenticatedToken(principal))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.name").value("사용자"))
                .andExpect(jsonPath("$.provider").value("GOOGLE"));
    }

    @Test
    void logoutReturnsNoContentForAuthenticatedUser() throws Exception {
        mockMvc.perform(post("/api/auth/logout").with(authentication(authenticatedToken(principal()))))
                .andExpect(status().isNoContent());
    }

    private TestingAuthenticationToken authenticatedToken(OAuth2User principal) {
        return new TestingAuthenticationToken(principal, null, "ROLE_USER");
    }

    private CareerdockOAuth2User principal() {
        LoginUser loginUser = new LoginUser(
                1L,
                "user@example.com",
                "사용자",
                null,
                AuthProvider.GOOGLE
        );
        return new CareerdockOAuth2User(
                loginUser,
                Map.of("sub", "google-subject"),
                List.of(),
                "sub"
        );
    }
}
