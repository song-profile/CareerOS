package com.careerdock.user.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void providerAndSubjectAreUnique() {
        User first = User.createGoogleUser("same-subject", "first@example.com", "첫 사용자", null);
        User second = User.createGoogleUser("same-subject", "second@example.com", "두 번째 사용자", null);

        userRepository.saveAndFlush(first);

        assertThatThrownBy(() -> userRepository.saveAndFlush(second))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void findsUserByProviderAndSubject() {
        User user = User.createGoogleUser("google-subject", "user@example.com", "사용자", null);
        userRepository.saveAndFlush(user);

        assertThat(userRepository.findByProviderAndProviderUserId(AuthProvider.GOOGLE, "google-subject"))
                .isPresent();
    }
}
