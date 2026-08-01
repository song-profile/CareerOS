package com.careerdock.application.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.application.repository.ApplicationStatusHistoryRepository;
import com.careerdock.company.repository.CompanyRepository;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
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
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    private User firstUser;
    private User secondUser;

    @BeforeEach
    void setUp() {
        statusHistoryRepository.deleteAll();
        applicationRepository.deleteAll();
        companyRepository.deleteAll();
        userRepository.deleteAll();

        firstUser = userRepository.save(User.createGoogleUser("subject-1", "first@example.com", "첫 사용자", null));
        secondUser = userRepository.save(User.createGoogleUser("subject-2", "second@example.com", "두 번째 사용자", null));
    }

    @Test
    void createsApplication() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequest("KB국민은행", "IT 개발")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.companyName").value("KB국민은행"))
                .andExpect(jsonPath("$.positionName").value("IT 개발"))
                .andExpect(jsonPath("$.status").value("WRITING"));
    }

    @Test
    void listsApplicationsWithKeywordAndDefaultDeadlineSort() throws Exception {
        createApplication(firstUser, "신한은행", "ICT", "2026-08-20T00:00:00Z");
        createApplication(firstUser, "KB국민은행", "IT 개발", "2026-08-10T00:00:00Z");
        createApplication(secondUser, "KB국민은행", "타 사용자", "2026-08-01T00:00:00Z");

        mockMvc.perform(get("/api/applications")
                        .queryParam("keyword", "IT")
                        .with(authentication(auth(firstUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName").value("KB국민은행"))
                .andExpect(jsonPath("$[0].positionName").value("IT 개발"));
    }

    @Test
    void findsApplicationDetail() throws Exception {
        long applicationId = createApplication(firstUser, "KB국민은행", "IT 개발", "2026-08-10T00:00:00Z");

        mockMvc.perform(get("/api/applications/{id}", applicationId).with(authentication(auth(firstUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(applicationId))
                .andExpect(jsonPath("$.companyName").value("KB국민은행"));
    }

    @Test
    void updatesApplicationAndReusesSameUserCompany() throws Exception {
        long firstId = createApplication(firstUser, "KB국민은행", "IT 개발", "2026-08-10T00:00:00Z");
        createApplication(firstUser, "KB국민은행", "디지털", "2027-03-01T00:00:00Z");

        mockMvc.perform(patch("/api/applications/{id}", firstId)
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateRequest("KB국민은행", "백엔드")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.positionName").value("백엔드"));

        assertThat(companyRepository.count()).isEqualTo(1);
    }

    @Test
    void changesStatusAndCreatesHistoryOnlyWhenChanged() throws Exception {
        long applicationId = createApplication(firstUser, "KB국민은행", "IT 개발", "2026-08-10T00:00:00Z");

        mockMvc.perform(patch("/api/applications/{id}/status", applicationId)
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"SUBMITTED"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.statusHistories[0].previousStatus").value("WRITING"))
                .andExpect(jsonPath("$.statusHistories[0].newStatus").value("SUBMITTED"));

        mockMvc.perform(patch("/api/applications/{id}/status", applicationId)
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"SUBMITTED"}
                                """))
                .andExpect(status().isOk());

        assertThat(statusHistoryRepository.findByApplicationIdOrderByChangedAtAsc(applicationId)).hasSize(1);
    }

    @Test
    void blocksOtherUserAccessWithNotFound() throws Exception {
        long applicationId = createApplication(firstUser, "KB국민은행", "IT 개발", "2026-08-10T00:00:00Z");

        mockMvc.perform(get("/api/applications/{id}", applicationId).with(authentication(auth(secondUser))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void validatesCreateRequest() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "companyName": "",
                                  "positionName": "",
                                  "recruitmentYear": 1999,
                                  "season": "FIRST_HALF",
                                  "postingUrl": "not-url",
                                  "applicationStartAt": "2026-08-10T00:00:00Z",
                                  "deadlineAt": "2026-08-01T00:00:00Z",
                                  "status": "WRITING",
                                  "memo": "memo"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.companyName").exists())
                .andExpect(jsonPath("$.fieldErrors.positionName").exists())
                .andExpect(jsonPath("$.fieldErrors.recruitmentYear").exists())
                .andExpect(jsonPath("$.fieldErrors.postingUrl").exists())
                .andExpect(jsonPath("$.fieldErrors.deadlineValid").exists());
    }

    @Test
    void returnsNotFoundForMissingId() throws Exception {
        mockMvc.perform(get("/api/applications/{id}", 999999L).with(authentication(auth(firstUser))))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletesApplication() throws Exception {
        long applicationId = createApplication(firstUser, "KB국민은행", "IT 개발", "2026-08-10T00:00:00Z");

        mockMvc.perform(delete("/api/applications/{id}", applicationId).with(authentication(auth(firstUser))))
                .andExpect(status().isNoContent());

        assertThat(applicationRepository.findById(applicationId)).isEmpty();
    }

    private long createApplication(User user, String companyName, String positionName, String deadlineAt) throws Exception {
        String response = mockMvc.perform(post("/api/applications")
                        .with(authentication(auth(user)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequest(companyName, positionName, deadlineAt)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode jsonNode = objectMapper.readTree(response);
        return jsonNode.get("id").asLong();
    }

    private String createRequest(String companyName, String positionName) {
        return createRequest(companyName, positionName, "2026-08-10T00:00:00Z");
    }

    private String createRequest(String companyName, String positionName, String deadlineAt) {
        return """
                {
                  "companyName": "%s",
                  "companyHomepageUrl": "https://example.com",
                  "positionName": "%s",
                  "recruitmentTitle": "2026 하반기 채용",
                  "recruitmentYear": 2026,
                  "season": "SECOND_HALF",
                  "postingUrl": "https://example.com/jobs",
                  "applicationStartAt": "2026-08-01T00:00:00Z",
                  "deadlineAt": "%s",
                  "status": "WRITING",
                  "workLocation": "서울",
                  "applicationSiteUrl": "https://example.com/apply",
                  "memo": "테스트 메모"
                }
                """.formatted(companyName, positionName, deadlineAt);
    }

    private String updateRequest(String companyName, String positionName) {
        return """
                {
                  "companyName": "%s",
                  "companyHomepageUrl": "https://example.com",
                  "positionName": "%s",
                  "recruitmentTitle": "2026 하반기 채용",
                  "recruitmentYear": 2026,
                  "season": "SECOND_HALF",
                  "postingUrl": "https://example.com/jobs",
                  "applicationStartAt": "2026-08-01T00:00:00Z",
                  "deadlineAt": "2026-08-10T00:00:00Z",
                  "workLocation": "서울",
                  "applicationSiteUrl": "https://example.com/apply",
                  "memo": "수정 메모"
                }
                """.formatted(companyName, positionName);
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
