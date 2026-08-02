package com.careerdock.file.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.file.repository.FileAssetRepository;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
class FileControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private FileAssetRepository fileAssetRepository;

    @Value("${app.file.storage-path}")
    private String storagePath;

    private User owner;
    private User otherUser;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");

        owner = userRepository.save(User.createGoogleUser("file-subject-1", "owner@example.com", "본인", null));
        otherUser = userRepository.save(User.createGoogleUser("file-subject-2", "other@example.com", "타인", null));
    }

    @Test
    void uploadsFileAndFiltersListByCategory() throws Exception {
        mockMvc.perform(multipart("/api/files")
                        .file(pdf("성적증명서.pdf"))
                        .param("category", "TRANSCRIPT")
                        .param("displayName", "2026 성적증명서")
                        .with(authentication(auth(owner))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.displayName").value("2026 성적증명서"))
                .andExpect(jsonPath("$.originalFilename").value("성적증명서.pdf"))
                .andExpect(jsonPath("$.mimeType").value("application/pdf"))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.downloadUrl").exists())
                // 스토리지 내부 구조는 응답에 나가지 않는다.
                .andExpect(jsonPath("$.storageKey").doesNotExist());

        upload(owner, png("증명사진.png"), "PROFILE_PHOTO");

        mockMvc.perform(get("/api/files").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(get("/api/files").param("category", "PROFILE_PHOTO")
                        .with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].originalFilename").value("증명사진.png"));
    }

    @Test
    void rejectsTypeOutsideAllowList() throws Exception {
        mockMvc.perform(multipart("/api/files")
                        .file(new MockMultipartFile("file", "이력서.html", "text/html", "<script/>".getBytes(StandardCharsets.UTF_8)))
                        .param("category", "OTHER")
                        .with(authentication(auth(owner))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("FILE_ERROR"));

        assertThat(fileAssetRepository.count()).isZero();
    }

    @Test
    void rejectsExtensionAndMimeMismatch() throws Exception {
        mockMvc.perform(multipart("/api/files")
                        .file(new MockMultipartFile("file", "위장.pdf", "image/png", "%PDF".getBytes(StandardCharsets.UTF_8)))
                        .param("category", "OTHER")
                        .with(authentication(auth(owner))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("FILE_ERROR"));
    }

    @Test
    void rejectsEmptyUpload() throws Exception {
        mockMvc.perform(multipart("/api/files")
                        .param("category", "OTHER")
                        .with(authentication(auth(owner))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("FILE_ERROR"));
    }

    @Test
    void stripsPathFromFilenameAndKeepsStorageKeyUnderRoot() throws Exception {
        long fileId = upload(owner, pdf("../../etc/passwd.pdf"), "OTHER");

        mockMvc.perform(get("/api/files/{id}", fileId).with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.originalFilename").value("passwd.pdf"));

        Path root = Path.of(storagePath).toAbsolutePath().normalize();
        Path stored = root.resolve(storageKeyOf(fileId)).normalize();
        assertThat(stored.startsWith(root)).isTrue();
        assertThat(Files.exists(stored)).isTrue();
    }

    @Test
    void downloadsOwnFileAsAttachment() throws Exception {
        long fileId = upload(owner, pdf("포트폴리오.pdf"), "PORTFOLIO");

        mockMvc.perform(get("/api/files/{id}/download", fileId).with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", startsWith("attachment")))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes("%PDF-1.4 test".getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void hidesOtherUsersFile() throws Exception {
        long fileId = upload(owner, pdf("본인파일.pdf"), "OTHER");

        mockMvc.perform(get("/api/files/{id}", fileId).with(authentication(auth(otherUser))))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/files/{id}/download", fileId).with(authentication(auth(otherUser))))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/files/{id}", fileId).with(authentication(auth(otherUser))))
                .andExpect(status().isNotFound());

        assertThat(fileAssetRepository.count()).isEqualTo(1);
    }

    @Test
    void deletesRecordAndStoredBody() throws Exception {
        long fileId = upload(owner, pdf("삭제대상.pdf"), "OTHER");
        Path stored = Path.of(storagePath).toAbsolutePath().normalize().resolve(storageKeyOf(fileId));
        assertThat(Files.exists(stored)).isTrue();

        mockMvc.perform(delete("/api/files/{id}", fileId).with(authentication(auth(owner))))
                .andExpect(status().isNoContent());

        assertThat(fileAssetRepository.count()).isZero();
        assertThat(Files.exists(stored)).isFalse();
    }

    @Test
    void blocksDeleteWhileCredentialReferencesFile() throws Exception {
        long fileId = upload(owner, pdf("자격증빙.pdf"), "CREDENTIAL_PROOF");
        long credentialId = createCredential(owner, fileId);

        mockMvc.perform(get("/api/credentials/{id}", credentialId).with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileAssetId").value(fileId));

        mockMvc.perform(delete("/api/files/{id}", fileId).with(authentication(auth(owner))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        assertThat(fileAssetRepository.count()).isEqualTo(1);

        // 연결을 해제하면 지울 수 있다.
        mockMvc.perform(patch("/api/credentials/{id}", credentialId)
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"CERTIFICATION",
                                  "name":"SQL 개발자",
                                  "acquiredAt":"2024-06-21",
                                  "permanent":true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileAssetId").doesNotExist());

        mockMvc.perform(delete("/api/files/{id}", fileId).with(authentication(auth(owner))))
                .andExpect(status().isNoContent());
    }

    @Test
    void rejectsLinkingSomeoneElsesFileToCredential() throws Exception {
        long fileId = upload(owner, pdf("본인파일.pdf"), "CREDENTIAL_PROOF");

        mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(otherUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"CERTIFICATION",
                                  "name":"남의 증빙 붙이기",
                                  "acquiredAt":"2024-06-21",
                                  "permanent":true,
                                  "fileAssetId":%d
                                }
                                """.formatted(fileId)))
                .andExpect(status().isNotFound());
    }

    private MockMultipartFile pdf(String filename) {
        return new MockMultipartFile(
                "file", filename, "application/pdf", "%PDF-1.4 test".getBytes(StandardCharsets.UTF_8));
    }

    private MockMultipartFile png(String filename) {
        return new MockMultipartFile("file", filename, "image/png", new byte[] {(byte) 0x89, 'P', 'N', 'G'});
    }

    private long upload(User user, MockMultipartFile file, String category) throws Exception {
        String response = mockMvc.perform(multipart("/api/files")
                        .file(file)
                        .param("category", category)
                        .with(authentication(auth(user))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private long createCredential(User user, long fileAssetId) throws Exception {
        String response = mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(user)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"CERTIFICATION",
                                  "name":"SQL 개발자",
                                  "acquiredAt":"2024-06-21",
                                  "permanent":true,
                                  "fileAssetId":%d
                                }
                                """.formatted(fileAssetId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private String storageKeyOf(long fileId) {
        return jdbcTemplate.queryForObject(
                "SELECT storage_key FROM file_assets WHERE id = ?", String.class, fileId);
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
