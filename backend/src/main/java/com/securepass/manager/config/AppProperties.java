package com.securepass.manager.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Jwt jwt,
        Aes aes,
        String frontendUrl,
        long resetTokenExpirationMinutes
) {
    public record Jwt(String secret, long expirationMs) {
    }

    public record Aes(String key) {
    }
}
