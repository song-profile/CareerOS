package com.careerdock.auth.controller;

import com.careerdock.auth.dto.CurrentUserResponse;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.exception.CareerdockException;
import com.careerdock.global.exception.ErrorCode;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public CurrentUserResponse me(@AuthenticationPrincipal CareerdockOAuth2User principal) {
        if (principal == null) {
            throw new CareerdockException(ErrorCode.UNAUTHORIZED);
        }

        User user = userRepository.findById(principal.loginUser().id())
                .orElseThrow(() -> new CareerdockException(ErrorCode.UNAUTHORIZED));
        return CurrentUserResponse.from(user);
    }
}
