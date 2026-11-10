package com.capitalatelier.api.dto;

import com.capitalatelier.api.enums.WalletRole;
import java.time.LocalDateTime;

public record WalletMemberResponseDTO(Long id, Long userId, String username, String email, WalletRole role,
		LocalDateTime joinedAt) {
}
