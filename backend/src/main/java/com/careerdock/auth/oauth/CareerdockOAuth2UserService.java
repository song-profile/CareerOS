package com.careerdock.auth.oauth;

import com.careerdock.global.auth.CareerdockOAuth2User;
import com.careerdock.global.auth.LoginUser;
import com.careerdock.user.domain.User;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CareerdockOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate;
    private final OAuthUserProvisioner userProvisioner;

    @Autowired
    public CareerdockOAuth2UserService(OAuthUserProvisioner userProvisioner) {
        this(new DefaultOAuth2UserService(), userProvisioner);
    }

    CareerdockOAuth2UserService(
            OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate,
            OAuthUserProvisioner userProvisioner
    ) {
        this.delegate = delegate;
        this.userProvisioner = userProvisioner;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = delegate.loadUser(userRequest);
        GoogleOAuthAttributes attributes = GoogleOAuthAttributes.from(oauth2User.getAttributes());
        User user = userProvisioner.provisionGoogleUser(attributes);

        String nameAttributeKey = userRequest.getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();

        return new CareerdockOAuth2User(
                LoginUser.from(user),
                oauth2User.getAttributes(),
                oauth2User.getAuthorities(),
                nameAttributeKey
        );
    }
}
