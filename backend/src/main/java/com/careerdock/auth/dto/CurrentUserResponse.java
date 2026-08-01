package com.careerdock.auth.dto;

import com.careerdock.global.auth.LoginUser;
import com.careerdock.user.domain.AuthProvider;

public record CurrentUserResponse(
        Long id,
        String email,
        String name,
        String profileImageUrl,
        AuthProvider provider
) {
    public static CurrentUserResponse from(LoginUser user) {
        return new CurrentUserResponse(
                user.id(),
                user.email(),
                user.name(),
                user.profileImageUrl(),
                user.provider()
        );
    }
}
