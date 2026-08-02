package com.careerdock.credential.service;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 자격번호 전용 AES-GCM 암복호화.
 *
 * 자격번호는 검색·정렬 대상이 아니므로 결정적 암호화가 필요 없다. 매 저장마다 새 IV를 뽑고
 * IV를 암호문 앞에 붙여 하나의 Base64 문자열로 저장한다. GCM은 인증 태그를 포함하므로
 * 저장된 값이 변조되면 복호화가 실패한다.
 *
 * 예외 메시지와 로그에는 키도 평문도 절대 넣지 않는다.
 */
@Component
public class CredentialNumberCipher {

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH_BITS = 128;

    private final SecretKey key;
    private final SecureRandom random = new SecureRandom();

    public CredentialNumberCipher(@Value("${app.security.credential-encryption-key}") String base64Key) {
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(base64Key);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("CREDENTIAL_ENCRYPTION_KEY must be Base64 encoded.");
        }
        if (keyBytes.length != 32) {
            throw new IllegalStateException("CREDENTIAL_ENCRYPTION_KEY must decode to 32 bytes (AES-256).");
        }
        this.key = new SecretKeySpec(keyBytes, "AES");
    }

    /** 값이 없으면 암호문도 만들지 않는다. */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.isBlank()) {
            return null;
        }
        byte[] iv = new byte[IV_LENGTH];
        random.nextBytes(iv);
        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            byte[] payload = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, payload, 0, iv.length);
            System.arraycopy(cipherText, 0, payload, iv.length, cipherText.length);
            return Base64.getEncoder().encodeToString(payload);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Failed to encrypt credential number.");
        }
    }

    public String decrypt(String storedValue) {
        if (storedValue == null || storedValue.isBlank()) {
            return null;
        }
        try {
            byte[] payload = Base64.getDecoder().decode(storedValue);
            if (payload.length <= IV_LENGTH) {
                throw new IllegalStateException("Stored credential number is malformed.");
            }
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(
                    Cipher.DECRYPT_MODE,
                    key,
                    new GCMParameterSpec(TAG_LENGTH_BITS, payload, 0, IV_LENGTH)
            );
            byte[] plain = cipher.doFinal(payload, IV_LENGTH, payload.length - IV_LENGTH);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException exception) {
            throw new IllegalStateException("Failed to decrypt credential number.");
        }
    }
}
