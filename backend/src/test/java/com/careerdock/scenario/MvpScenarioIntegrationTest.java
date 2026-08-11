package com.careerdock.scenario;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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

/**
 * 기획서 MVP 완료 시나리오를 API 수준에서 처음부터 끝까지 검증한다.
 *
 * 로그인 → SQLD 자격증 등록 → GitHub/Notion 링크 등록 → KB국민은행 지원 건과 마감일 등록 →
 * 자소서 문항·답변 저장 → 지원동기 유형과 LOODI 경험 태그 연결 → 증명사진·자격증·포트폴리오를
 * 지원 건에 연결. Google OAuth 자체는 브라우저 리다이렉트가 필요해 이 테스트로 재현할 수 없고,
 * 그 대신 이미 로그인된 세션을 흉내 내는 방식은 이 저장소의 다른 모든 컨트롤러 테스트와 같다.
 *
 * 각 단계는 별도의 MockMvc 호출로 커밋된 DB를 다시 읽는다. 이 클래스는 롤백 트랜잭션으로
 * 감싸지 않으므로(다른 테스트 클래스들과 동일하게 TRUNCATE로 정리), 마지막 통합 조회는
 * 인메모리 상태가 아니라 실제로 커밋된 데이터를 다시 조회한 결과다.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MvpScenarioIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;

    private User applicant;
    private User otherApplicant;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");
        applicant = userRepository.save(
                User.createGoogleUser("mvp-scenario-subject", "applicant@example.com", "지원자", null));
        otherApplicant = userRepository.save(
                User.createGoogleUser("mvp-scenario-other", "other@example.com", "타인", null));
    }

    @Test
    void completesMvpScenarioEndToEndAndIsolatesOtherUsers() throws Exception {
        // 1. 로그인 - Google OAuth 리다이렉트는 이 테스트가 대신할 수 없다. /api/auth/me로
        // 이미 로그인된 세션에서 본인 정보를 확인할 수 있는지만 확인한다.
        mockMvc.perform(get("/api/auth/me").with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("applicant@example.com"))
                .andExpect(jsonPath("$.provider").value("GOOGLE"));

        // 2. SQLD 자격증 등록
        long credentialId = id(mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"CERTIFICATION",
                                  "name":"SQLD",
                                  "issuer":"한국데이터산업진흥원",
                                  "acquiredAt":"2025-06-21",
                                  "credentialNumber":"SQLD-2025-000123",
                                  "permanent":true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.credentialNumberMasked").value("SQLD************"))
                .andExpect(jsonPath("$.credentialNumber").doesNotExist()));

        // 3. GitHub, Notion 링크 등록
        long githubLinkId = id(mockMvc.perform(post("/api/external-links")
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"linkType":"GITHUB","displayName":"내 깃허브","url":"https://github.com/applicant"}
                                """))
                .andExpect(status().isCreated()));
        long notionLinkId = id(mockMvc.perform(post("/api/external-links")
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"linkType":"NOTION","displayName":"내 노션","url":"https://notion.so/applicant"}
                                """))
                .andExpect(status().isCreated()));

        // 4. KB국민은행 IT 개발 지원 건과 마감일 등록
        long applicationId = id(mockMvc.perform(post("/api/applications")
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "companyName":"KB국민은행",
                                  "positionName":"IT 개발",
                                  "recruitmentTitle":"2026 하반기 IT 개발",
                                  "recruitmentYear":2026,
                                  "season":"SECOND_HALF",
                                  "applicationStartAt":"2026-08-01T00:00:00Z",
                                  "deadlineAt":"2026-08-31T15:00:00Z",
                                  "status":"WRITING"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.companyName").value("KB국민은행"))
                .andExpect(jsonPath("$.deadlineAt").value("2026-08-31T15:00:00Z")));

        // 5. 실제 자소서 문항과 답변 저장
        long questionId = id(mockMvc.perform(post("/api/applications/{id}/essay-questions", applicationId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "questionOrder":1,
                                  "questionText":"지원동기를 작성하세요.",
                                  "characterLimit":700,
                                  "commonQuestionType":"MOTIVATION"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.commonQuestionType").value("MOTIVATION")));

        long answerId = id(mockMvc.perform(post("/api/essay-questions/{questionId}/answers", questionId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"LOODI 프로젝트에서 은행 IT 문제를 해결한 경험을 바탕으로 지원합니다."}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT")));

        // 6. 지원동기 유형(문항에 이미 지정)과 LOODI 경험 태그 연결
        long tagId = id(mockMvc.perform(post("/api/experience-tags")
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"LOODI","description":"은행 IT 문제 해결 프로젝트"}
                                """))
                .andExpect(status().isCreated()));
        mockMvc.perform(post("/api/essay-answers/{id}/tags", answerId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tagId":%d}
                                """.formatted(tagId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.experienceTags[0].name").value("LOODI"));

        // 7. 증명사진·자격증·포트폴리오를 지원 건에 연결
        long profilePhotoId = id(mockMvc.perform(multipart("/api/files")
                        .file(new MockMultipartFile("file", "증명사진.jpg", "image/jpeg", new byte[] {(byte) 0xFF, (byte) 0xD8}))
                        .param("category", "PROFILE_PHOTO")
                        .with(authentication(auth(applicant))))
                .andExpect(status().isCreated()));
        long portfolioId = id(mockMvc.perform(multipart("/api/files")
                        .file(new MockMultipartFile("file", "포트폴리오.pdf", "application/pdf",
                                "%PDF-1.4 portfolio".getBytes(StandardCharsets.UTF_8)))
                        .param("category", "PORTFOLIO")
                        .with(authentication(auth(applicant))))
                .andExpect(status().isCreated()));

        mockMvc.perform(post("/api/applications/{id}/files", applicationId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fileAssetId":%d,"purpose":"증명사진"}
                                """.formatted(profilePhotoId)))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/applications/{id}/files", applicationId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fileAssetId":%d,"purpose":"포트폴리오"}
                                """.formatted(portfolioId)))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/applications/{id}/credentials", applicationId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"credentialId":%d,"purpose":"자격 증빙"}
                                """.formatted(credentialId)))
                .andExpect(status().isCreated());

        // 새로고침(재요청) 후에도 커밋된 데이터가 그대로 보이는지 통합 조회로 확인한다.
        mockMvc.perform(get("/api/applications/{id}/resources", applicationId)
                        .with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.files.length()").value(2))
                .andExpect(jsonPath("$.credentials.length()").value(1))
                .andExpect(jsonPath("$.credentials[0].name").value("SQLD"))
                .andExpect(jsonPath("$.essayQuestions.length()").value(1))
                .andExpect(jsonPath("$.essayQuestions[0].hasSubmittedAnswer").value(false));

        mockMvc.perform(get("/api/external-links").with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(get("/api/credentials/{id}/number", credentialId)
                        .with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.credentialNumber").value("SQLD-2025-000123"));

        // 다른 사용자는 이 시나리오의 어떤 데이터도 볼 수 없다.
        mockMvc.perform(get("/api/applications/{id}/resources", applicationId)
                        .with(authentication(auth(otherApplicant))))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/credentials/{id}", credentialId).with(authentication(auth(otherApplicant))))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/files/{id}/download", portfolioId).with(authentication(auth(otherApplicant))))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/external-links").with(authentication(auth(otherApplicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        // 등록한 두 링크 id가 실제로 이 계정의 목록에 남아 있는지 재확인한다.
        String links = mockMvc.perform(get("/api/external-links").with(authentication(auth(applicant))))
                .andReturn().getResponse().getContentAsString();
        List<Long> linkIds = objectMapper.readTree(links).findValuesAsText("id").stream().map(Long::valueOf).toList();
        org.assertj.core.api.Assertions.assertThat(linkIds).containsExactlyInAnyOrder(githubLinkId, notionLinkId);
    }

    /**
     * 23단계 최종 QA에서 위 시나리오만으로는 확인되지 않던 부분을 이어서 확인한다.
     *
     * - 자격증을 설명·증빙파일까지 채워 등록하고, 수정한 뒤에도 값이 남는지
     * - 마감일이 있는 지원 건이 목록·상세·캘린더 자동 일정·대시보드에 함께 반영되는지
     * - 마감일을 고치면 자동 일정도 따라 움직이는지
     * - 답변 수정과 버전 생성 뒤 태그 연결이 어느 버전에 남는지
     */
    @Test
    void keepsCredentialDetailsDeadlineScheduleAndAnswerVersions() throws Exception {
        // 시나리오 2. 증빙파일을 먼저 올리고, 설명까지 채워 SQLD를 등록한다.
        long evidenceFileId = id(mockMvc.perform(multipart("/api/files")
                        .file(new MockMultipartFile("file", "sqld-증빙.pdf", "application/pdf",
                                "%PDF-1.4 evidence".getBytes(StandardCharsets.UTF_8)))
                        .param("category", "CREDENTIAL_PROOF")
                        .with(authentication(auth(applicant))))
                .andExpect(status().isCreated()));

        long credentialId = id(mockMvc.perform(post("/api/credentials")
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"CERTIFICATION",
                                  "name":"SQLD",
                                  "issuer":"한국데이터산업진흥원",
                                  "acquiredAt":"2025-06-21",
                                  "credentialNumber":"SQLD-2025-000123",
                                  "permanent":true,
                                  "description":"SQL 개발자 자격",
                                  "fileAssetId":%d
                                }
                                """.formatted(evidenceFileId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value("SQL 개발자 자격"))
                .andExpect(jsonPath("$.fileAssetId").value((int) evidenceFileId))
                .andExpect(jsonPath("$.credentialNumberMasked").value("SQLD************")));

        // 수정한 뒤 다시 조회해도 설명·증빙파일·마스킹이 그대로다.
        mockMvc.perform(patch("/api/credentials/{id}", credentialId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "credentialType":"CERTIFICATION",
                                  "name":"SQLD",
                                  "issuer":"한국데이터산업진흥원",
                                  "acquiredAt":"2025-06-21",
                                  "credentialNumber":"SQLD-2025-000123",
                                  "permanent":true,
                                  "description":"SQL 개발자 자격 (수정)",
                                  "fileAssetId":%d
                                }
                                """.formatted(evidenceFileId)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/credentials/{id}", credentialId).with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("SQL 개발자 자격 (수정)"))
                .andExpect(jsonPath("$.fileAssetId").value((int) evidenceFileId))
                .andExpect(jsonPath("$.credentialNumberMasked").value("SQLD************"))
                .andExpect(jsonPath("$.credentialNumber").doesNotExist());

        // 시나리오 4. 마감일이 지금 기준으로 3일 뒤여야 대시보드의 이번 주 마감에 잡힌다.
        Instant deadline = Instant.now().plus(3, ChronoUnit.DAYS).truncatedTo(ChronoUnit.SECONDS);
        long applicationId = id(mockMvc.perform(post("/api/applications")
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(applicationJson("KB국민은행", "IT 개발", deadline)))
                .andExpect(status().isCreated()));

        mockMvc.perform(get("/api/applications").with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].companyName").value("KB국민은행"));
        mockMvc.perform(get("/api/applications/{id}", applicationId).with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.positionName").value("IT 개발"));

        // 마감일에서 캘린더 일정이 자동으로 만들어진다.
        mockMvc.perform(get("/api/calendar/events")
                        .param("applicationId", String.valueOf(applicationId))
                        .with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].autoGenerated").value(true))
                .andExpect(jsonPath("$[0].eventType").value("APPLICATION_DEADLINE"))
                .andExpect(jsonPath("$[0].startAt").value(deadline.toString()))
                .andExpect(jsonPath("$[0].title").value("KB국민은행 IT 개발 지원 마감"));

        mockMvc.perform(get("/api/dashboard/summary").with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.upcomingDeadlines[0].applicationId").value((int) applicationId))
                .andExpect(jsonPath("$.summary.weeklyDeadlineCount").value(1));

        // 마감일을 바꾸면 자동 일정도 새로 만들지 않고 같은 일정을 옮긴다.
        Instant movedDeadline = deadline.plus(2, ChronoUnit.DAYS);
        mockMvc.perform(patch("/api/applications/{id}", applicationId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(applicationJson("KB국민은행", "IT 개발", movedDeadline)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/calendar/events")
                        .param("applicationId", String.valueOf(applicationId))
                        .with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].startAt").value(movedDeadline.toString()));

        // 시나리오 5. 문항을 만들고 답변을 저장한 뒤 수정한다.
        long questionId = id(mockMvc.perform(post("/api/applications/{id}/essay-questions", applicationId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "questionOrder":1,
                                  "questionText":"KB국민은행에 지원한 동기를 작성해 주세요.",
                                  "characterLimit":700,
                                  "commonQuestionType":"MOTIVATION"
                                }
                                """))
                .andExpect(status().isCreated()));

        long answerId = id(mockMvc.perform(post("/api/essay-questions/{id}/answers", questionId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"첫 초안입니다."}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.version").value(1)));

        mockMvc.perform(patch("/api/essay-answers/{id}", answerId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"수정한 초안입니다."}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("수정한 초안입니다."))
                .andExpect(jsonPath("$.version").value(1));

        // 시나리오 6. LOODI 태그는 지금 버전에 붙는다.
        long tagId = id(mockMvc.perform(post("/api/experience-tags")
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"LOODI","description":"은행 IT 문제 해결 프로젝트"}
                                """))
                .andExpect(status().isCreated()));
        mockMvc.perform(post("/api/essay-answers/{id}/tags", answerId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"tagId":%d}
                                """.formatted(tagId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.experienceTags.length()").value(1));

        // 제출본으로 잠근 뒤 개선본을 만든다. 제출본은 그대로 남고 버전만 늘어난다.
        mockMvc.perform(post("/api/essay-answers/{id}/submit-lock", answerId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"제출한 내용입니다."}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));

        long improvedId = id(mockMvc.perform(post("/api/essay-answers/{id}/versions", answerId)
                        .with(authentication(auth(applicant)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"content":"제출 후 다듬은 내용입니다."}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("IMPROVED"))
                .andExpect(jsonPath("$.version").value(2)));

        /*
         * 연결 정책: 공통 질문 유형(지원동기)은 문항이 가지므로 버전이 바뀌어도 그대로 따라온다.
         * 반면 경험 태그(LOODI)는 답변 버전이 가지므로 새 버전에는 자동으로 옮겨 붙지 않는다.
         * 어느 버전에 어떤 경험을 근거로 썼는지가 버전별로 남아야 하기 때문이다.
         */
        mockMvc.perform(get("/api/essay-answers/{id}/versions", answerId)
                        .with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value((int) improvedId))
                .andExpect(jsonPath("$[0].experienceTags.length()").value(0))
                .andExpect(jsonPath("$[1].id").value((int) answerId))
                .andExpect(jsonPath("$[1].experienceTags[0].name").value("LOODI"))
                .andExpect(jsonPath("$[1].content").value("제출한 내용입니다."))
                .andExpect(jsonPath("$[0].questionId").value((int) questionId));

        mockMvc.perform(get("/api/applications/{id}/essay-questions", applicationId)
                        .with(authentication(auth(applicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].commonQuestionType").value("MOTIVATION"));

        // 남의 계정에서는 이 시나리오의 자동 일정과 자소서 버전도 보이지 않는다.
        mockMvc.perform(get("/api/calendar/events").with(authentication(auth(otherApplicant))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(get("/api/essay-answers/{id}/versions", answerId)
                        .with(authentication(auth(otherApplicant))))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/essay-answers/{id}/tags/{tagId}", answerId, tagId)
                        .with(authentication(auth(otherApplicant))))
                .andExpect(status().isNotFound());
    }

    private String applicationJson(String companyName, String positionName, Instant deadlineAt) {
        return """
                {
                  "companyName":"%s",
                  "positionName":"%s",
                  "recruitmentTitle":"2026 하반기 IT 개발",
                  "recruitmentYear":2026,
                  "season":"SECOND_HALF",
                  "deadlineAt":"%s",
                  "status":"WRITING"
                }
                """.formatted(companyName, positionName, deadlineAt);
    }

    private long id(org.springframework.test.web.servlet.ResultActions result) throws Exception {
        String response = result.andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
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
