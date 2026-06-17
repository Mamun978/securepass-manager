package com.securepass.manager.service;

import com.securepass.manager.config.AppProperties;
import com.securepass.manager.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_BYTES = 12;
    private static final int TAG_BITS = 128;

    private final AppProperties properties;
    private final SecureRandom secureRandom = new SecureRandom();
    private SecretKeySpec keySpec;

    @PostConstruct
    void init() {
        String configuredKey = properties.aes().key();
        if (configuredKey == null || configuredKey.isBlank() || configuredKey.startsWith("${")) {
            throw new BadRequestException("AES_KEY environment variable is required and must be base64 encoded");
        }

        byte[] key;
        try {
            key = Base64.getDecoder().decode(configuredKey);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("AES_KEY must be valid base64");
        }

        if (key.length != 16 && key.length != 24 && key.length != 32) {
            throw new BadRequestException("AES_KEY must be a base64 encoded 16, 24, or 32 byte key");
        }
        keySpec = new SecretKeySpec(key, "AES");
    }

    public String encrypt(String plainText) {
        try {
            byte[] iv = new byte[IV_BYTES];
            secureRandom.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(TAG_BITS, iv));
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(iv) + "." + Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception ex) {
            throw new BadRequestException("Unable to encrypt vault password");
        }
    }

    public String decrypt(String cipherText) {
        try {
            String[] parts = cipherText.split("\\.");
            byte[] iv = Base64.getDecoder().decode(parts[0]);
            byte[] encrypted = Base64.getDecoder().decode(parts[1]);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, new GCMParameterSpec(TAG_BITS, iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new BadRequestException("Unable to decrypt vault password");
        }
    }
}
