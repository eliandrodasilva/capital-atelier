package com.capitalatelier.api.dto;

import java.time.LocalDateTime;

import com.capitalatelier.api.enums.WalletRole;

public record WalletResponseDTO(
    Long id,
    String name,
    String description,
    Long ownerId,
    String ownerName,
    WalletRole role,
    LocalDateTime createdAt
) {}
