package com.careerdock.auth.controller;

import com.careerdock.auth.dto.CurrentUserResponse;
import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.exception.CareerdockException;
import com.careerdock.global.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @GetMapping("/me")
    public CurrentUserResponse me(
            @AuthenticationPrincipal CareerdockOAuth2User principal,
            Authentication authentication
    ) {
        // 인증 필터는 통과했지만 principal이 우리 타입이 아니면 여기서 null이 된다.
        // 그대로 두면 NPE가 500으로 나가므로, 다른 컨트롤러가 CurrentUserAccessor에서
        // 하는 것과 똑같이 401로 돌려준다.
        if (principal == null) {
            log.warn(
                    "principal이 CareerdockOAuth2User가 아니다: authentication={}, principal={}",
                    authentication == null ? "null" : authentication.getClass().getName(),
                    authentication == null || authentication.getPrincipal() == null
                            ? "null"
                            : authentication.getPrincipal().getClass().getName()
            );
            throw new CareerdockException(ErrorCode.UNAUTHORIZED);
        }

        return CurrentUserResponse.from(principal.loginUser());
    }
}
