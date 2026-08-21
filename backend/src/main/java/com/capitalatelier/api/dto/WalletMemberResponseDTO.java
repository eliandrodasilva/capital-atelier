package com.capitalatelier.api.dto;

import java.time.LocalDateTime;

import com.capitalatelier.api.enums.WalletRole;

public record WalletMemberResponseDTO(
    Long id,
    Long userId,
    String username,
    String email,
    WalletRole role,
    LocalDateTime joinedAt
) {}
