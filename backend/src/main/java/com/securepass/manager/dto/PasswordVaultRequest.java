package com.securepass.manager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordVaultRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 500) String websiteUrl,
        @NotBlank @Size(max = 180) String username,
        @NotBlank @Size(min = 4, max = 500) String password,
        @Size(max = 5000) String notes
) {
}
