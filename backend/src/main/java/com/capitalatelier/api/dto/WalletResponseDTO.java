package com.capitalatelier.api.dto;

import com.capitalatelier.api.enums.WalletRole;
import java.time.LocalDateTime;

public record WalletResponseDTO(Long id, String name, String description, Long ownerId, String ownerName,
		WalletRole role, LocalDateTime createdAt) {
}
