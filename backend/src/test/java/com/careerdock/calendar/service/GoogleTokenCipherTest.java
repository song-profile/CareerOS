package com.careerdock.calendar.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.careerdock.global.config.GoogleCalendarProperties;
import java.net.URI;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class GoogleTokenCipherTest {

    private static final String VALID_KEY = "Y2FyZWVyZG9jay1sb2NhbC10b2tlbi1rZXktMzJieXg=";

    private GoogleTokenCipher cipher(String key) {
        return new GoogleTokenCipher(new GoogleCalendarProperties(
                URI.create("http://localhost:8080/api/calendar/oauth/callback"), key));
    }

    @Test
    void encryptsAndDecryptsRoundTrip() {
        GoogleTokenCipher cipher = cipher(VALID_KEY);

        String encrypted = cipher.encrypt("1//refresh-token-value");

        assertThat(encrypted).isNotEqualTo("1//refresh-token-value");
        assertThat(cipher.decrypt(encrypted)).isEqualTo("1//refresh-token-value");
    }

    @Test
    void encryptingTheSameValueTwiceProducesDifferentCiphertext() {
        GoogleTokenCipher cipher = cipher(VALID_KEY);

        String first = cipher.encrypt("same-refresh-token");
        String second = cipher.encrypt("same-refresh-token");

        assertThat(first).isNotEqualTo(second);
        assertThat(cipher.decrypt(first)).isEqualTo(cipher.decrypt(second));
    }

    @Test
    void returnsNullForNullOrBlankInput() {
        GoogleTokenCipher cipher = cipher(VALID_KEY);

        assertThat(cipher.encrypt(null)).isNull();
        assertThat(cipher.encrypt("   ")).isNull();
        assertThat(cipher.decrypt(null)).isNull();
        assertThat(cipher.decrypt("   ")).isNull();
    }

    @Test
    void rejectsKeyThatIsNotBase64() {
        assertThatThrownBy(() -> cipher("not-valid-base64!!!"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void rejectsKeyThatDoesNotDecodeTo32Bytes() {
        String shortKey = Base64.getEncoder().encodeToString("too-short-key".getBytes());

        assertThatThrownBy(() -> cipher(shortKey))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void rejectsTamperedCiphertext() {
        GoogleTokenCipher cipher = cipher(VALID_KEY);
        String encrypted = cipher.encrypt("refresh-token");
        String tampered = encrypted.substring(0, encrypted.length() - 4) + "abcd";

        assertThatThrownBy(() -> cipher.decrypt(tampered))
                .isInstanceOf(IllegalStateException.class);
    }
}
