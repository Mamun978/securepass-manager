package com.securepass.manager.dto;

import java.time.Instant;

public record ResetTokenResponse(
        String resetToken,
        Instant expiresAt,
        String resetUrl
) {
}
