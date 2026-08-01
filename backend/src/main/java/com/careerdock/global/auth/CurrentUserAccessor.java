package com.careerdock.global.auth;

import com.careerdock.global.exception.ErrorCode;
import com.careerdock.global.exception.CareerdockException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserAccessor {

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CareerdockOAuth2User principal)) {
            throw new CareerdockException(ErrorCode.UNAUTHORIZED);
        }
        return principal.loginUser().id();
    }
}
