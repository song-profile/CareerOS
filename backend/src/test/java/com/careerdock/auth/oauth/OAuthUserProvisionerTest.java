package com.careerdock.auth.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.careerdock.user.domain.AuthProvider;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OAuthUserProvisionerTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OAuthUserProvisioner userProvisioner;

    @Test
    void createsNewGoogleUserWhenSubjectDoesNotExist() {
        GoogleOAuthAttributes attributes = new GoogleOAuthAttributes(
                "google-subject-1",
                "user@example.com",
                "사용자",
                null
        );
        User savedUser = User.createGoogleUser(
                attributes.subject(),
                attributes.email(),
                attributes.name(),
                attributes.profileImageUrl()
        );

        when(userRepository.findByProviderAndProviderUserId(AuthProvider.GOOGLE, attributes.subject()))
                .thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = userProvisioner.provisionGoogleUser(attributes);

        assertThat(result.getProvider()).isEqualTo(AuthProvider.GOOGLE);
        assertThat(result.getProviderUserId()).isEqualTo("google-subject-1");
        assertThat(result.getEmail()).isEqualTo("user@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updatesExistingGoogleUserWithoutDuplicateCreation() {
        User existingUser = User.createGoogleUser(
                "google-subject-1",
                "old@example.com",
                "기존 사용자",
                null
        );
        GoogleOAuthAttributes attributes = new GoogleOAuthAttributes(
                "google-subject-1",
                "new@example.com",
                "새 이름",
                "https://example.com/profile.png"
        );

        when(userRepository.findByProviderAndProviderUserId(AuthProvider.GOOGLE, attributes.subject()))
                .thenReturn(Optional.of(existingUser));

        User result = userProvisioner.provisionGoogleUser(attributes);

        assertThat(result.getEmail()).isEqualTo("new@example.com");
        assertThat(result.getName()).isEqualTo("새 이름");
        assertThat(result.getProfileImageUrl()).isEqualTo("https://example.com/profile.png");
        verify(userRepository, never()).save(any(User.class));
    }
}
