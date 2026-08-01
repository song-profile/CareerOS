package com.careerdock.auth.controller;

import com.careerdock.auth.dto.CurrentUserResponse;
import com.careerdock.global.auth.CareerdockOAuth2User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal CareerdockOAuth2User principal) {
        return CurrentUserResponse.from(principal.loginUser());
    }
}
