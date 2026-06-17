package com.securepass.manager.service;

import com.securepass.manager.config.AppProperties;
import com.securepass.manager.dto.AuthResponse;
import com.securepass.manager.dto.ForgotPasswordRequest;
import com.securepass.manager.dto.LoginRequest;
import com.securepass.manager.dto.RegisterRequest;
import com.securepass.manager.dto.ResetPasswordRequest;
import com.securepass.manager.dto.ResetTokenResponse;
import com.securepass.manager.dto.UserResponse;
import com.securepass.manager.entity.PasswordResetToken;
import com.securepass.manager.entity.User;
import com.securepass.manager.exception.BadRequestException;
import com.securepass.manager.repository.PasswordResetTokenRepository;
import com.securepass.manager.repository.UserRepository;
import com.securepass.manager.security.JwtService;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final JwtService jwtService;
    private final AppProperties properties;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        User saved = userRepository.save(user);
        return toAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        return toAuthResponse(user);
    }

    @Transactional
    public ResetTokenResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElse(null);
        if (user == null) {
            return null;
        }

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(generateResetToken());
        resetToken.setExpiresAt(Instant.now().plusSeconds(properties.resetTokenExpirationMinutes() * 60));
        PasswordResetToken saved = resetTokenRepository.save(resetToken);
        String resetUrl = primaryFrontendUrl() + "/reset-password?token=" + saved.getToken();
        return new ResetTokenResponse(saved.getToken(), saved.getExpiresAt(), resetUrl);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));
        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Reset token has expired or already been used");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        resetToken.setUsed(true);
        userRepository.save(user);
        resetTokenRepository.save(resetToken);
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(jwtService.generateToken(user), "Bearer", new UserResponse(user.getId(), user.getName(), user.getEmail()));
    }

    private String generateResetToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String primaryFrontendUrl() {
        return properties.frontendUrl().split(",")[0].trim();
    }
}
