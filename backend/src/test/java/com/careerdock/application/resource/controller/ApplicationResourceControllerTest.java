package com.careerdock.application.resource.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.RecruitmentSeason;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.application.resource.repository.ApplicationCredentialRepository;
import com.careerdock.application.resource.repository.ApplicationExternalLinkRepository;
import com.careerdock.application.resource.repository.ApplicationFileRepository;
import com.careerdock.company.domain.Company;
import com.careerdock.company.repository.CompanyRepository;
import com.careerdock.credential.repository.CredentialRepository;
import com.careerdock.file.repository.FileAssetRepository;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.link.repository.ExternalLinkRepository;
import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApplicationResourceControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private FileAssetRepository fileAssetRepository;
    @Autowired private CredentialRepository credentialRepository;
    @Autowired private ExternalLinkRepository externalLinkRepository;
    @Autowired private ApplicationFileRepository applicationFileRepository;
    @Autowired private ApplicationCredentialRepository applicationCredentialRepository;
    @Autowired private ApplicationExternalLinkRepository applicationExternalLinkRepository;

    private User owner;
    private User otherUser;
    private Application ownerApplication;
    private Application otherApplication;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");

        owner = userRepository.save(User.createGoogleUser("resource-subject-1", "owner@example.com", "본인", null));
        otherUser = userRepository.save(User.createGoogleUser("resource-subject-2", "other@example.com", "타인", null));
        ownerApplication = createApplication(owner, "KB국민은행", "IT 개발");
        otherApplication = createApplication(otherUser, "타인은행", "타인 직무");
    }

    @Test
    void linksFileToApplication() throws Exception {
        long fileAssetId = uploadFile(owner, "졸업증명서.pdf", "GRADUATION_CERTIFICATE");

        mockMvc.perform(post("/api/applications/{id}/files", ownerApplication.getId())
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fileAssetId":%d,"purpose":"최종 제출 파일"}
                                """.formatted(fileAssetId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fileAssetId").value(fileAssetId))
                .andExpect(jsonPath("$.category").value("GRADUATION_CERTIFICATE"))
                .andExpect(jsonPath("$.originalFilename").value("졸업증명서.pdf"))
                .andExpect(jsonPath("$.lockedVersion").value(1))
                .andExpect(jsonPath("$.purpose").value("최종 제출 파일"))
                .andExpect(jsonPath("$.downloadUrl").value("/api/files/" + fileAssetId + "/download"));
    }

    @Test
    void linksCredentialToApplication() throws Exception {
        long credentialId = createCredential(owner, "SQLD");

        mockMvc.perform(post("/api/applications/{id}/credentials", ownerApplication.getId())
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"credentialId":%d,"purpose":"자격 증빙"}
                                """.formatted(credentialId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.credentialId").value(credentialId))
                .andExpect(jsonPath("$.name").value("SQLD"))
                .andExpect(jsonPath("$.purpose").value("자격 증빙"))
                // 자격번호는 이 응답에서 다루지 않는다.
                .andExpect(jsonPath("$.credentialNumberMasked").doesNotExist());
    }

    @Test
    void linksExternalLinkToApplication() throws Exception {
        long linkId = createExternalLink(owner, "내 깃허브", "https://github.com/example");

        mockMvc.perform(post("/api/applications/{id}/external-links", ownerApplication.getId())
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"externalLinkId":%d,"purpose":"포트폴리오 링크"}
                                """.formatted(linkId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.externalLinkId").value(linkId))
                .andExpect(jsonPath("$.displayName").value("내 깃허브"))
                .andExpect(jsonPath("$.purpose").value("포트폴리오 링크"));
    }

    @Test
    void rejectsDuplicateLink() throws Exception {
        long fileAssetId = uploadFile(owner, "포트폴리오.pdf", "PORTFOLIO");
        linkFile(owner, ownerApplication.getId(), fileAssetId, null);

        mockMvc.perform(post("/api/applications/{id}/files", ownerApplication.getId())
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fileAssetId":%d}
                                """.formatted(fileAssetId)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DUPLICATE_RESOURCE"));

        assertThat(applicationFileRepository.count()).isEqualTo(1);
    }

    @Test
    void rejectsLinkingAnotherUsersResources() throws Exception {
        long otherUsersFile = uploadFile(otherUser, "타인파일.pdf", "OTHER");
        long otherUsersCredential = createCredential(otherUser, "타인자격");
        long otherUsersLink = createExternalLink(otherUser, "타인깃허브", "https://github.com/other");

        mockMvc.perform(post("/api/applications/{id}/files", ownerApplication.getId())
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fileAssetId":%d}
                                """.formatted(otherUsersFile)))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/applications/{id}/credentials", ownerApplication.getId())
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"credentialId":%d}
                                """.formatted(otherUsersCredential)))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/applications/{id}/external-links", ownerApplication.getId())
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"externalLinkId":%d}
                                """.formatted(otherUsersLink)))
                .andExpect(status().isNotFound());

        // 남의 지원 건에 내 자료를 붙이려는 시도도 같은 이유로 막힌다.
        long myFile = uploadFile(owner, "내파일.pdf", "OTHER");
        mockMvc.perform(post("/api/applications/{id}/files", otherApplication.getId())
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fileAssetId":%d}
                                """.formatted(myFile)))
                .andExpect(status().isNotFound());

        assertThat(applicationFileRepository.count()).isZero();
        assertThat(applicationCredentialRepository.count()).isZero();
        assertThat(applicationExternalLinkRepository.count()).isZero();
    }

    @Test
    void unlinksResourceWithoutDeletingOriginal() throws Exception {
        long fileAssetId = uploadFile(owner, "자격증빙.pdf", "CREDENTIAL_PROOF");
        linkFile(owner, ownerApplication.getId(), fileAssetId, null);

        mockMvc.perform(delete("/api/applications/{id}/files/{fileId}", ownerApplication.getId(), fileAssetId)
                        .with(authentication(auth(owner))))
                .andExpect(status().isNoContent());

        assertThat(applicationFileRepository.count()).isZero();
        // 연결만 없어지고 파일 원본은 그대로 남는다.
        assertThat(fileAssetRepository.count()).isEqualTo(1);
        mockMvc.perform(get("/api/files/{id}", fileAssetId).with(authentication(auth(owner))))
                .andExpect(status().isOk());
    }

    @Test
    void blocksDeletingOriginalResourceWhileLinked() throws Exception {
        long fileAssetId = uploadFile(owner, "제출파일.pdf", "PORTFOLIO");
        long credentialId = createCredential(owner, "제출자격");
        long linkId = createExternalLink(owner, "제출링크", "https://github.com/submitted");
        linkFile(owner, ownerApplication.getId(), fileAssetId, null);
        linkCredential(owner, ownerApplication.getId(), credentialId, null);
        linkExternalLink(owner, ownerApplication.getId(), linkId, null);

        mockMvc.perform(delete("/api/files/{id}", fileAssetId).with(authentication(auth(owner))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));
        mockMvc.perform(delete("/api/credentials/{id}", credentialId).with(authentication(auth(owner))))
                .andExpect(status().isConflict());
        mockMvc.perform(delete("/api/external-links/{id}", linkId).with(authentication(auth(owner))))
                .andExpect(status().isConflict());

        assertThat(fileAssetRepository.count()).isEqualTo(1);
        assertThat(credentialRepository.count()).isEqualTo(1);
        assertThat(externalLinkRepository.count()).isEqualTo(1);
    }

    @Test
    void findsAllResourcesConnectedToApplication() throws Exception {
        long fileAssetId = uploadFile(owner, "이력서.pdf", "OTHER");
        long credentialId = createCredential(owner, "정보처리기사");
        long linkId = createExternalLink(owner, "내 노션", "https://notion.so/example");
        linkFile(owner, ownerApplication.getId(), fileAssetId, "이력서 첨부");
        linkCredential(owner, ownerApplication.getId(), credentialId, null);
        linkExternalLink(owner, ownerApplication.getId(), linkId, null);

        long questionId = createEssayQuestion(ownerApplication.getId(), "지원동기를 작성하세요.");
        long answerId = createEssayAnswer(questionId, "초안입니다.");
        submitLockAnswer(answerId, "제출한 지원동기입니다.");

        mockMvc.perform(get("/api/applications/{id}/resources", ownerApplication.getId())
                        .with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationId").value(ownerApplication.getId()))
                .andExpect(jsonPath("$.files.length()").value(1))
                .andExpect(jsonPath("$.files[0].purpose").value("이력서 첨부"))
                .andExpect(jsonPath("$.credentials.length()").value(1))
                .andExpect(jsonPath("$.credentials[0].name").value("정보처리기사"))
                .andExpect(jsonPath("$.externalLinks.length()").value(1))
                .andExpect(jsonPath("$.externalLinks[0].displayName").value("내 노션"))
                .andExpect(jsonPath("$.essayQuestions.length()").value(1))
                .andExpect(jsonPath("$.essayQuestions[0].id").value(questionId))
                .andExpect(jsonPath("$.essayQuestions[0].hasSubmittedAnswer").value(true))
                .andExpect(jsonPath("$.essayQuestions[0].submittedAnswerId").value(answerId));
    }

    @Test
    void hidesOtherUsersApplicationResources() throws Exception {
        long fileAssetId = uploadFile(owner, "본인파일.pdf", "OTHER");
        linkFile(owner, ownerApplication.getId(), fileAssetId, null);

        mockMvc.perform(get("/api/applications/{id}/resources", ownerApplication.getId())
                        .with(authentication(auth(otherUser))))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/applications/{id}/files/{fileId}", ownerApplication.getId(), fileAssetId)
                        .with(authentication(auth(otherUser))))
                .andExpect(status().isNotFound());

        assertThat(applicationFileRepository.count()).isEqualTo(1);
    }

    private void linkFile(User user, Long applicationId, long fileAssetId, String purpose) throws Exception {
        mockMvc.perform(post("/api/applications/{id}/files", applicationId)
                        .with(authentication(auth(user)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fileAssetId", fileAssetId,
                                "purpose", purpose == null ? "" : purpose))))
                .andExpect(status().isCreated());
    }

    private void linkCredential(User user, Long applicationId, long credentialId, String purpose) throws Exception {
        mockMvc.perform(post("/api/applications/{id}/credentials", applicationId)
                        .with(authentication(auth(user)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "credentialId", credentialId,
                                "purpose", purpose == null ? "" : purpose))))
                .andExpect(status().isCreated());
    }

    private void linkExternalLink(User user, Long applicationId, long linkId, String purpose) throws Exception {
        mockMvc.perform(post("/api/applications/{id}/external-links", applicationId)
                        .with(authentication(auth(user)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "externalLinkId", linkId,
                                "purpose", purpose == null ? "" : purpose))))
                .andExpect(status().isCreated());
    }

    private long uploadFile(User user, String filename, String category) throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", filename, "application/pdf", "%PDF-1.4 test".getBytes(StandardCharsets.UTF_8));
        String response = mockMvc.perform(multipart("/api/files")
                        .file(file)
                        .param("category", category)
                        .with(authentication(auth(user))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private long createCredential(User user, String name) throws Exception {
        String response = mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(user)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"CERTIFICATION",
                                  "name":"%s",
                                  "acquiredAt":"2024-06-21",
                                  "permanent":true
                                }
                                """.formatted(name)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private long createExternalLink(User user, String displayName, String url) throws Exception {
        String response = mockMvc.perform(post("/api/external-links")
                        .with(authentication(auth(user)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "linkType":"GITHUB",
                                  "displayName":"%s",
                                  "url":"%s"
                                }
                                """.formatted(displayName, url)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private long createEssayQuestion(Long applicationId, String text) throws Exception {
        String response = mockMvc.perform(post("/api/applications/{applicationId}/essay-questions", applicationId)
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "questionOrder":1,
                                  "questionText":"%s",
                                  "characterLimit":700,
                                  "commonQuestionType":"MOTIVATION"
                                }
                                """.formatted(text)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private long createEssayAnswer(long questionId, String content) throws Exception {
        String response = mockMvc.perform(post("/api/essay-questions/{questionId}/answers", questionId)
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"%s"}
                                """.formatted(content)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private void submitLockAnswer(long answerId, String content) throws Exception {
        mockMvc.perform(post("/api/essay-answers/{id}/submit-lock", answerId)
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"%s"}
                                """.formatted(content)))
                .andExpect(status().isOk());
    }

    private Application createApplication(User user, String companyName, String positionName) {
        Company company = companyRepository.save(Company.create(user, companyName, null, null));
        return applicationRepository.save(Application.create(
                user,
                company,
                positionName,
                "2026 하반기",
                2026,
                RecruitmentSeason.SECOND_HALF,
                null,
                null,
                Instant.parse("2026-09-30T00:00:00Z"),
                ApplicationStatus.WRITING,
                null,
                null,
                null
        ));
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
