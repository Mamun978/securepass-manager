package com.securepass.manager.dto;

public record AuthResponse(
        String token,
        String tokenType,
        UserResponse user
) {
}
