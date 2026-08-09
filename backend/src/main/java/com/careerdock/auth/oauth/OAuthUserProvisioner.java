package com.careerdock.auth.oauth;

import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OAuthUserProvisioner {

    private static final Logger log = LoggerFactory.getLogger(OAuthUserProvisioner.class);

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
        User saved = userRepository.save(user);
        // 신규 가입은 최초 1회뿐이라 양이 적고, 로그인 실패 조사에서 가장 먼저 확인하는 값이다.
        log.info("google 신규 사용자 등록: userId={}, provider=GOOGLE", saved.getId());
        return saved;
    }
}
