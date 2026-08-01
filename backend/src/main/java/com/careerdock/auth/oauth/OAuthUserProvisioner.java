package com.careerdock.auth.oauth;

import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OAuthUserProvisioner {

    private final UserRepository userRepository;

    public OAuthUserProvisioner(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User provisionGoogleUser(GoogleOAuthAttributes attributes) {
        return userRepository.findByProviderAndProviderUserId(AuthProvider.GOOGLE, attributes.subject())
                .map(user -> updateExistingUser(user, attributes))
                .orElseGet(() -> createNewUser(attributes));
    }

    private User updateExistingUser(User user, GoogleOAuthAttributes attributes) {
        user.updateGoogleProfile(attributes.email(), attributes.name(), attributes.profileImageUrl());
        return user;
    }

    private User createNewUser(GoogleOAuthAttributes attributes) {
        User user = User.createGoogleUser(
                attributes.subject(),
                attributes.email(),
                attributes.name(),
                attributes.profileImageUrl()
        );
        return userRepository.save(user);
    }
}
