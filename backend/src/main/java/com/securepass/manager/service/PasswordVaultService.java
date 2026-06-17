package com.securepass.manager.service;

import com.securepass.manager.dto.PasswordVaultRequest;
import com.securepass.manager.dto.PasswordVaultResponse;
import com.securepass.manager.entity.PasswordVault;
import com.securepass.manager.entity.User;
import com.securepass.manager.exception.ResourceNotFoundException;
import com.securepass.manager.repository.PasswordVaultRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordVaultService {

    private final PasswordVaultRepository vaultRepository;
    private final EncryptionService encryptionService;

    @Transactional
    public PasswordVaultResponse create(User user, PasswordVaultRequest request) {
        PasswordVault vault = new PasswordVault();
        applyRequest(vault, request);
        vault.setUser(user);
        return toResponse(vaultRepository.save(vault), false);
    }

    @Transactional(readOnly = true)
    public List<PasswordVaultResponse> list(User user, String query) {
        List<PasswordVault> items = query == null || query.isBlank()
                ? vaultRepository.findByUserOrderByUpdatedAtDesc(user)
                : vaultRepository.search(user, query.trim());
        return items.stream().map(item -> toResponse(item, false)).toList();
    }

    @Transactional(readOnly = true)
    public PasswordVaultResponse get(User user, Long id, boolean reveal) {
        PasswordVault vault = getOwned(user, id);
        return toResponse(vault, reveal);
    }

    @Transactional
    public PasswordVaultResponse update(User user, Long id, PasswordVaultRequest request) {
        PasswordVault vault = getOwned(user, id);
        applyRequest(vault, request);
        return toResponse(vaultRepository.save(vault), false);
    }

    @Transactional
    public void delete(User user, Long id) {
        PasswordVault vault = getOwned(user, id);
        vaultRepository.delete(vault);
    }

    private PasswordVault getOwned(User user, Long id) {
        return vaultRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Password item not found"));
    }

    private void applyRequest(PasswordVault vault, PasswordVaultRequest request) {
        vault.setTitle(request.title().trim());
        vault.setWebsiteUrl(request.websiteUrl());
        vault.setUsername(request.username().trim());
        vault.setEncryptedPassword(encryptionService.encrypt(request.password()));
        vault.setNotes(request.notes());
    }

    private PasswordVaultResponse toResponse(PasswordVault vault, boolean reveal) {
        return new PasswordVaultResponse(
                vault.getId(),
                vault.getTitle(),
                vault.getWebsiteUrl(),
                vault.getUsername(),
                reveal ? encryptionService.decrypt(vault.getEncryptedPassword()) : null,
                vault.getNotes(),
                vault.getCreatedAt(),
                vault.getUpdatedAt()
        );
    }
}
