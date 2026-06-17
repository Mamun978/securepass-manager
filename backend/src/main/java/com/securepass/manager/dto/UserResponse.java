package com.securepass.manager.dto;

public record UserResponse(
        Long id,
        String name,
        String email
) {
}
