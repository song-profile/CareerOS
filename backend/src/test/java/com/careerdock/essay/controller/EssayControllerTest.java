package com.careerdock.essay.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.RecruitmentSeason;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.company.domain.Company;
import com.careerdock.company.repository.CompanyRepository;
import com.careerdock.essay.repository.EssayAnswerRepository;
import com.careerdock.essay.repository.EssayAnswerTagRepository;
import com.careerdock.essay.repository.EssayQuestionRepository;
import com.careerdock.essay.repository.ExperienceTagRepository;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
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
class EssayControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private EssayQuestionRepository questionRepository;
    @Autowired private EssayAnswerRepository answerRepository;
    @Autowired private ExperienceTagRepository tagRepository;
    @Autowired private EssayAnswerTagRepository answerTagRepository;

    private User firstUser;
    private User secondUser;
    private Application firstApplication;

    @BeforeEach
    void setUp() {
        answerTagRepository.deleteAll();
        answerRepository.deleteAll();
        questionRepository.deleteAll();
        tagRepository.deleteAll();
        applicationRepository.deleteAll();
        companyRepository.deleteAll();
        userRepository.deleteAll();

        firstUser = userRepository.save(User.createGoogleUser("essay-subject-1", "first@example.com", "첫 사용자", null));
        secondUser = userRepository.save(User.createGoogleUser("essay-subject-2", "second@example.com", "두 번째 사용자", null));
        firstApplication = createApplication(firstUser, "KB국민은행", "IT 개발");
        createApplication(secondUser, "신한은행", "ICT");
    }

    @Test
    void createsQuestionAndDraftAnswerWithServerCharacterCount() throws Exception {
        long questionId = createQuestion(firstApplication.getId(), "문제 해결 경험을 설명하세요.", "PROBLEM_SOLVING");

        mockMvc.perform(post("/api/essay-questions/{questionId}/answers", questionId)
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"안녕하세요"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.characterCount").value(5))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void submitLockRejectsSubmittedAnswerMutationAndImprovedVersionIncrements() throws Exception {
        long questionId = createQuestion(firstApplication.getId(), "지원동기를 쓰세요.", "MOTIVATION");
        long answerId = createAnswer(questionId, "초안");

        mockMvc.perform(post("/api/essay-answers/{id}/submit-lock", answerId)
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"제출본"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.submittedAt").exists());

        mockMvc.perform(patch("/api/essay-answers/{id}", answerId)
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"수정 시도"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        mockMvc.perform(post("/api/essay-answers/{id}/versions", answerId)
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"개선본"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("IMPROVED"))
                .andExpect(jsonPath("$.version").value(2));
    }

    @Test
    void connectsTagAndSupportsCompositeFilter() throws Exception {
        long questionId = createQuestion(firstApplication.getId(), "문제 해결 경험을 설명하세요.", "PROBLEM_SOLVING");
        long answerId = createAnswer(questionId, "LOODI로 은행 IT 문제를 해결했습니다.");
        long tagId = createTag("LOODI");

        mockMvc.perform(post("/api/essay-answers/{id}/tags", answerId)
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tagId":%d}
                                """.formatted(tagId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.experienceTags[0].name").value("LOODI"));

        mockMvc.perform(get("/api/essays")
                        .queryParam("company", "은행")
                        .queryParam("position", "IT")
                        .queryParam("commonType", "PROBLEM_SOLVING")
                        .queryParam("experienceTag", String.valueOf(tagId))
                        .queryParam("answerStatus", "DRAFT")
                        .queryParam("recruitmentYear", "2026")
                        .queryParam("keyword", "LOODI")
                        .with(authentication(auth(firstUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(answerId));

        mockMvc.perform(delete("/api/essay-answers/{id}/tags/{tagId}", answerId, tagId)
                        .with(authentication(auth(firstUser))))
                .andExpect(status().isNoContent());
        assertThat(answerTagRepository.existsByAnswerIdAndTagId(answerId, tagId)).isFalse();
    }

    @Test
    void blocksOtherUserQuestionAnswerAndTagAccess() throws Exception {
        long questionId = createQuestion(firstApplication.getId(), "지원동기를 쓰세요.", "MOTIVATION");
        long answerId = createAnswer(questionId, "초안");
        long tagId = createTag("LOODI");

        mockMvc.perform(post("/api/essay-questions/{questionId}/answers", questionId)
                        .with(authentication(auth(secondUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"침범"}
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(patch("/api/essay-answers/{id}", answerId)
                        .with(authentication(auth(secondUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"침범"}
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/essay-answers/{id}/tags", answerId)
                        .with(authentication(auth(secondUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tagId":%d}
                                """.formatted(tagId)))
                .andExpect(status().isNotFound());
    }

    private Application createApplication(User user, String companyName, String positionName) {
        Company company = companyRepository.save(Company.create(user, companyName, "https://example.com", null));
        return applicationRepository.save(Application.create(
                user,
                company,
                positionName,
                "2026 채용",
                2026,
                RecruitmentSeason.SECOND_HALF,
                "https://example.com/jobs",
                Instant.parse("2026-08-01T00:00:00Z"),
                Instant.parse("2026-08-10T00:00:00Z"),
                ApplicationStatus.WRITING,
                "서울",
                "https://example.com/apply",
                null
        ));
    }

    private long createQuestion(Long applicationId, String text, String type) throws Exception {
        String response = mockMvc.perform(post("/api/applications/{applicationId}/essay-questions", applicationId)
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "questionOrder":1,
                                  "questionText":"%s",
                                  "characterLimit":700,
                                  "commonQuestionType":"%s"
                                }
                                """.formatted(text, type)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return idFrom(response);
    }

    private long createAnswer(long questionId, String content) throws Exception {
        String response = mockMvc.perform(post("/api/essay-questions/{questionId}/answers", questionId)
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"%s"}
                                """.formatted(content)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return idFrom(response);
    }

    private long createTag(String name) throws Exception {
        String response = mockMvc.perform(post("/api/experience-tags")
                        .with(authentication(auth(firstUser)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","description":"경험 태그"}
                                """.formatted(name)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return idFrom(response);
    }

    private long idFrom(String response) throws Exception {
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
