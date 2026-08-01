package com.careerdock.global.auth;

import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import java.io.Serializable;

public record LoginUser(
        Long id,
        String email,
        String name,
        String profileImageUrl,
        AuthProvider provider
) implements Serializable {

    public static LoginUser from(User user) {
        return new LoginUser(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getProfileImageUrl(),
                user.getProvider()
        );
    }
}
