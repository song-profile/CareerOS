package com.careerdock.credential.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.credential.repository.CredentialAccessAuditRepository;
import com.careerdock.credential.repository.CredentialRepository;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
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
class CredentialControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private CredentialRepository credentialRepository;
    @Autowired private CredentialAccessAuditRepository auditRepository;

    private User owner;
    private User otherUser;

    @BeforeEach
    void setUp() {
        // 모든 테스트 클래스가 Postgres 컨테이너 하나를 공유하므로 앞선 클래스가 남긴
        // companies·applications 등이 users 삭제를 막는다. CASCADE는 users를 참조하는
        // 테이블을 따라가며 비우므로 기능이 늘어도 이 목록을 고칠 필요가 없다.
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");

        owner = userRepository.save(User.createGoogleUser("credential-subject-1", "owner@example.com", "본인", null));
        otherUser = userRepository.save(User.createGoogleUser("credential-subject-2", "other@example.com", "타인", null));
    }

    @Test
    void createsCredentialAndReturnsMaskedNumberOnly() throws Exception {
        mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"CERTIFICATION",
                                  "name":"SQL 개발자",
                                  "issuer":"한국데이터산업진흥원",
                                  "acquiredAt":"2024-06-21",
                                  "credentialNumber":"SQLD-123456",
                                  "permanent":true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.credentialNumberMasked").value("SQLD*******"))
                .andExpect(jsonPath("$.hasCredentialNumber").value(true))
                .andExpect(jsonPath("$.credentialNumber").doesNotExist());

        mockMvc.perform(get("/api/credentials").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].credentialNumberMasked").value("SQLD*******"));
    }

    @Test
    void storesCredentialNumberAsCiphertext() throws Exception {
        createCredential(owner, """
                {
                  "credentialType":"CERTIFICATION",
                  "name":"정보처리기사",
                  "acquiredAt":"2024-05-01",
                  "credentialNumber":"SQLD-123456",
                  "permanent":true
                }
                """);

        String stored = jdbcTemplate.queryForObject(
                "SELECT credential_number_encrypted FROM credentials", String.class);

        assertThat(stored).isNotNull();
        assertThat(stored).doesNotContain("SQLD-123456");
    }

    @Test
    void sameNumberProducesDifferentCiphertextPerRow() throws Exception {
        String body = """
                {
                  "credentialType":"CERTIFICATION",
                  "name":"%s",
                  "acquiredAt":"2024-05-01",
                  "credentialNumber":"SQLD-123456",
                  "permanent":true
                }
                """;
        createCredential(owner, body.formatted("자격 A"));
        createCredential(owner, body.formatted("자격 B"));

        List<String> stored = jdbcTemplate.queryForList(
                "SELECT credential_number_encrypted FROM credentials", String.class);

        assertThat(stored).hasSize(2);
        assertThat(stored.get(0)).isNotEqualTo(stored.get(1));
    }

    @Test
    void ownerReadsFullNumberAndAccessIsAudited() throws Exception {
        long credentialId = createCredential(owner, """
                {
                  "credentialType":"CERTIFICATION",
                  "name":"정보처리기사",
                  "acquiredAt":"2024-05-01",
                  "credentialNumber":"SQLD-123456",
                  "permanent":true
                }
                """);

        mockMvc.perform(get("/api/credentials/{id}/number", credentialId).with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.credentialNumber").value("SQLD-123456"));

        assertThat(auditRepository.findByCredentialIdOrderByAccessedAtDesc(credentialId))
                .singleElement()
                .satisfies(audit -> assertThat(audit.getUserId()).isEqualTo(owner.getId()));
    }

    @Test
    void otherUserCannotReadCredentialOrFullNumber() throws Exception {
        long credentialId = createCredential(owner, """
                {
                  "credentialType":"CERTIFICATION",
                  "name":"정보처리기사",
                  "acquiredAt":"2024-05-01",
                  "credentialNumber":"SQLD-123456",
                  "permanent":true
                }
                """);

        mockMvc.perform(get("/api/credentials/{id}", credentialId).with(authentication(auth(otherUser))))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/credentials/{id}/number", credentialId).with(authentication(auth(otherUser))))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/credentials").with(authentication(auth(otherUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        assertThat(auditRepository.count()).isZero();
    }

    @Test
    void rejectsPermanentCredentialWithExpiryDate() throws Exception {
        mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"CERTIFICATION",
                                  "name":"정보처리기사",
                                  "acquiredAt":"2024-05-01",
                                  "expiresAt":"2030-05-01",
                                  "permanent":true
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }

    @Test
    void rejectsExpiryBeforeValidFromAndFutureAcquiredDate() throws Exception {
        mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"LANGUAGE",
                                  "name":"TOEIC",
                                  "acquiredAt":"2024-05-01",
                                  "validFrom":"2024-06-01",
                                  "expiresAt":"2024-05-15",
                                  "permanent":false
                                }
                                """))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"LANGUAGE",
                                  "name":"TOEIC",
                                  "acquiredAt":"%s",
                                  "permanent":false
                                }
                                """.formatted(LocalDate.now().plusDays(1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void rejectsNonHttpReferenceUrl() throws Exception {
        mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"CERTIFICATION",
                                  "name":"정보처리기사",
                                  "acquiredAt":"2024-05-01",
                                  "permanent":true,
                                  "referenceUrl":"javascript:alert(1)"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void languageCredentialKeepsScoreAndGrade() throws Exception {
        mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"LANGUAGE",
                                  "name":"TOEIC Speaking",
                                  "acquiredAt":"2024-05-01",
                                  "score":"170",
                                  "grade":"IH",
                                  "expiresAt":"2026-05-01",
                                  "permanent":false
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.score").value("170"))
                .andExpect(jsonPath("$.grade").value("IH"))
                .andExpect(jsonPath("$.credentialNumberMasked").doesNotExist());
    }

    @Test
    void filtersCredentialsExpiringWithinGivenDays() throws Exception {
        createCredential(owner, """
                {
                  "credentialType":"LANGUAGE",
                  "name":"곧 만료",
                  "acquiredAt":"2024-05-01",
                  "expiresAt":"%s",
                  "permanent":false
                }
                """.formatted(LocalDate.now().plusDays(10)));
        createCredential(owner, """
                {
                  "credentialType":"LANGUAGE",
                  "name":"여유 있음",
                  "acquiredAt":"2024-05-01",
                  "expiresAt":"%s",
                  "permanent":false
                }
                """.formatted(LocalDate.now().plusDays(300)));
        createCredential(owner, """
                {
                  "credentialType":"CERTIFICATION",
                  "name":"영구 자격",
                  "acquiredAt":"2024-05-01",
                  "permanent":true
                }
                """);

        mockMvc.perform(get("/api/credentials").param("expiringInDays", "30")
                        .with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("곧 만료"));

        mockMvc.perform(get("/api/credentials").param("type", "CERTIFICATION")
                        .with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("영구 자격"));
    }

    @Test
    void deletesCredentialWithItsAuditTrail() throws Exception {
        long credentialId = createCredential(owner, """
                {
                  "credentialType":"CERTIFICATION",
                  "name":"정보처리기사",
                  "acquiredAt":"2024-05-01",
                  "credentialNumber":"SQLD-123456",
                  "permanent":true
                }
                """);
        mockMvc.perform(get("/api/credentials/{id}/number", credentialId).with(authentication(auth(owner))))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/credentials/{id}", credentialId).with(authentication(auth(owner))))
                .andExpect(status().isNoContent());

        assertThat(credentialRepository.count()).isZero();
        assertThat(auditRepository.count()).isZero();
    }

    private long createCredential(User user, String body) throws Exception {
        String response = mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(user)))
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
