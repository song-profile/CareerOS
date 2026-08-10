package com.careerdock.profile.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
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
class PersonalInfoControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;

    private User owner;
    private User otherUser;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");

        owner = userRepository.save(User.createGoogleUser("profile-owner", "owner@example.com", "본인", null));
        otherUser = userRepository.save(User.createGoogleUser("profile-other", "other@example.com", "타인", null));
    }

    @Test
    void profileRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void returnsEmptyProfileWhenNotSavedYet() throws Exception {
        mockMvc.perform(get("/api/profile").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").doesNotExist())
                .andExpect(jsonPath("$.schoolName").doesNotExist())
                .andExpect(jsonPath("$.updatedAt").doesNotExist());
    }

    @Test
    void savesAndUpdatesCurrentUsersProfile() throws Exception {
        mockMvc.perform(patch("/api/profile")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "phone": "010-1234-5678",
                                  "address": "서울시 강남구",
                                  "schoolName": "아주대학교",
                                  "major": "소프트웨어학과",
                                  "doubleMajor": "경영학",
                                  "minor": "데이터사이언스",
                                  "graduationStatus": "EXPECTED",
                                  "graduationDate": "2027-02-28",
                                  "gpa": 4.12,
                                  "gpaScale": 4.5,
                                  "militaryStatus": "COMPLETED",
                                  "militaryBranch": "육군",
                                  "militaryRank": "병장",
                                  "militaryDischargeDate": "2024-08-01",
                                  "careerSummary": "백엔드 인턴 6개월"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").value("010-1234-5678"))
                .andExpect(jsonPath("$.schoolName").value("아주대학교"))
                .andExpect(jsonPath("$.graduationStatus").value("EXPECTED"))
                .andExpect(jsonPath("$.gpa").value(4.12))
                .andExpect(jsonPath("$.gpaScale").value(4.5))
                .andExpect(jsonPath("$.militaryStatus").value("COMPLETED"))
                .andExpect(jsonPath("$.updatedAt").exists());

        mockMvc.perform(patch("/api/profile")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "phone": "010-9999-0000",
                                  "address": "",
                                  "schoolName": "아주대학교",
                                  "major": "소프트웨어학과",
                                  "gpa": 4.3,
                                  "gpaScale": 4.5,
                                  "militaryStatus": "COMPLETED"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").value("010-9999-0000"))
                .andExpect(jsonPath("$.address").doesNotExist())
                .andExpect(jsonPath("$.careerSummary").doesNotExist());

        mockMvc.perform(get("/api/profile").with(authentication(auth(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").value("010-9999-0000"))
                .andExpect(jsonPath("$.schoolName").value("아주대학교"));
    }

    @Test
    void isolatesProfileByCurrentUser() throws Exception {
        mockMvc.perform(patch("/api/profile")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "phone": "010-1111-2222",
                                  "address": "서울시",
                                  "schoolName": "아주대학교",
                                  "major": "소프트웨어학과"
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/profile").with(authentication(auth(otherUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").doesNotExist())
                .andExpect(jsonPath("$.schoolName").doesNotExist());
    }

    @Test
    void rejectsInvalidProfileValues() throws Exception {
        mockMvc.perform(patch("/api/profile")
                        .with(authentication(auth(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "phone": "010-1234-ABCD",
                                  "gpa": 5.1,
                                  "gpaScale": 4.5
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.phone").exists())
                .andExpect(jsonPath("$.fieldErrors.gpa").exists());
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
