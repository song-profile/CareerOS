package com.careerdock.link.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.link.repository.ExternalLinkRepository;
import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ExternalLinkControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private ExternalLinkRepository linkRepository;
    @Autowired private JdbcTemplate jdbcTemplate;

    private User owner;
    private User otherUser;

    @BeforeEach
    void setUp() {
        // 모든 테스트 클래스가 Postgres 컨테이너 하나를 공유하므로 앞선 클래스가 남긴
        // companies·applications 등이 users 삭제를 막는다. CASCADE는 users를 참조하는
        // 테이블을 따라가며 비우므로 기능이 늘어도 이 목록을 고칠 필요가 없다.
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");

        owner = userRepository.save(User.createGoogleUser("link-subject-1", "owner@example.com", "본인", null));
        otherUser = userRepository.save(User.createGoogleUser("link-subject-2", "other@example.com", "타인", null));
    }

    @Test
    void createsUpdatesAndDeletesLink() throws Exception {
        long linkId = createLink("""
                {
                  "linkType":"GITHUB",
                  "displayName":"내 깃허브",
                  "url":"https://github.com/example",
                  "description":"사이드 프로젝트 저장소",
                  "projectName":"CareerDock"
                }
                """);

        mockMvc.perform(get("/api/external-links").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].displayName").value("내 깃허브"))
                .andExpect(jsonPath("$[0].visibility").value("PRIVATE"));

        mockMvc.perform(patch("/api/external-links/{id}", linkId)
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "linkType":"DEPLOYED_SERVICE",
                                  "displayName":"배포 주소",
                                  "url":"https://careerdock.example.com",
                                  "visibility":"PUBLIC"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.linkType").value("DEPLOYED_SERVICE"))
                .andExpect(jsonPath("$.visibility").value("PUBLIC"));

        mockMvc.perform(delete("/api/external-links/{id}", linkId).with(authentication(auth(owner))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/external-links").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void rejectsDangerousOrMalformedUrl() throws Exception {
        for (String url : List.of("javascript:alert(1)", "ftp://example.com/file", "example.com")) {
            mockMvc.perform(post("/api/external-links")
                            .with(authentication(auth(owner)))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"linkType":"OTHER","displayName":"위험 링크","url":"%s"}
                                    """.formatted(url)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }
    }

    @Test
    void rejectsBlankDisplayName() throws Exception {
        mockMvc.perform(post("/api/external-links")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"linkType":"BLOG","displayName":"  ","url":"https://blog.example.com"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.displayName").exists());
    }

    @Test
    void otherUserCannotSeeOrModifyLink() throws Exception {
        long linkId = createLink("""
                {"linkType":"NOTION","displayName":"내 노션","url":"https://notion.so/example"}
                """);

        mockMvc.perform(get("/api/external-links").with(authentication(auth(otherUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(delete("/api/external-links/{id}", linkId).with(authentication(auth(otherUser))))
                .andExpect(status().isNotFound());
    }

    private long createLink(String body) throws Exception {
        String response = mockMvc.perform(post("/api/external-links")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        JsonNode jsonNode = objectMapper.readTree(response);
        return jsonNode.get("id").asLong();
    }

    private Authentication auth(User user) {
        LoginUser loginUser = new LoginUser(user.getId(), user.getEmail(), user.getName(), null, AuthProvider.GOOGLE);
        CareerdockOAuth2User principal = new CareerdockOAuth2User(
                loginUser,
                Map.of("sub", user.getProviderUserId()),
                List.of(),
                "sub"
        );
        return new TestingAuthenticationToken(principal, null, "ROLE_USER");
    }
}
