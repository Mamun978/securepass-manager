package com.securepass.manager.controller;

import com.securepass.manager.dto.ApiResponse;
import com.securepass.manager.dto.PasswordVaultRequest;
import com.securepass.manager.dto.PasswordVaultResponse;
import com.securepass.manager.entity.User;
import com.securepass.manager.service.PasswordVaultService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vault")
@RequiredArgsConstructor
public class PasswordVaultController {

    private final PasswordVaultService vaultService;

    @PostMapping
    ResponseEntity<ApiResponse<PasswordVaultResponse>> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PasswordVaultRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Password item created", vaultService.create(user, request)));
    }

    @GetMapping
    ApiResponse<List<PasswordVaultResponse>> list(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String q
    ) {
        return ApiResponse.ok("Password items loaded", vaultService.list(user, q));
    }

    @GetMapping("/{id}")
    ApiResponse<PasswordVaultResponse> get(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean reveal
    ) {
        return ApiResponse.ok("Password item loaded", vaultService.get(user, id, reveal));
    }

    @PutMapping("/{id}")
    ApiResponse<PasswordVaultResponse> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody PasswordVaultRequest request
    ) {
        return ApiResponse.ok("Password item updated", vaultService.update(user, id, request));
    }

    @DeleteMapping("/{id}")
    ApiResponse<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        vaultService.delete(user, id);
        return ApiResponse.ok("Password item deleted", null);
    }
}
