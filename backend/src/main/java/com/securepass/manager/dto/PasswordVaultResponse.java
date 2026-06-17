package com.securepass.manager.dto;

import java.time.Instant;

public record PasswordVaultResponse(
        Long id,
        String title,
        String websiteUrl,
        String username,
        String password,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}
