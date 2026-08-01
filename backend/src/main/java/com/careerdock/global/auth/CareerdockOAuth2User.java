package com.careerdock.global.auth;

import java.util.Collection;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

public class CareerdockOAuth2User implements OAuth2User {

    private final LoginUser loginUser;
    private final Map<String, Object> attributes;
    private final Collection<? extends GrantedAuthority> authorities;
    private final String nameAttributeKey;

    public CareerdockOAuth2User(
            LoginUser loginUser,
            Map<String, Object> attributes,
            Collection<? extends GrantedAuthority> authorities,
            String nameAttributeKey
    ) {
        this.loginUser = loginUser;
        this.attributes = Map.copyOf(attributes);
        this.authorities = authorities;
        this.nameAttributeKey = nameAttributeKey;
    }

    public LoginUser loginUser() {
        return loginUser;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getName() {
        Object nameAttribute = attributes.get(nameAttributeKey);
        return nameAttribute == null ? String.valueOf(loginUser.id()) : String.valueOf(nameAttribute);
    }
}
