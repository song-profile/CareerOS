package com.careerdock.auth.oauth;

import com.careerdock.global.exception.CareerdockException;
import com.careerdock.global.exception.ErrorCode;
import java.util.Map;

public record GoogleOAuthAttributes(
        String subject,
        String email,
        String name,
        String profileImageUrl
) {
    public static GoogleOAuthAttributes from(Map<String, Object> attributes) {
        String subject = getRequiredString(attributes, "sub");
        String email = getRequiredString(attributes, "email");
        String name = getString(attributes, "name", email);
        String profileImageUrl = getString(attributes, "picture", null);
        return new GoogleOAuthAttributes(subject, email, name, profileImageUrl);
    }

    private static String getRequiredString(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        if (!(value instanceof String text) || text.isBlank()) {
            throw new CareerdockException(ErrorCode.BAD_REQUEST, "Google 사용자 정보를 확인할 수 없습니다.");
        }
        return text;
    }

    private static String getString(Map<String, Object> attributes, String key, String defaultValue) {
        Object value = attributes.get(key);
        if (!(value instanceof String text) || text.isBlank()) {
            return defaultValue;
        }
        return text;
    }
}
