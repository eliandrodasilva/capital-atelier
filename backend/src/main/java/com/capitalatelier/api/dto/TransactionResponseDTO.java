package com.capitalatelier.api.dto;

import com.capitalatelier.api.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransactionResponseDTO(Long id, Long walletId, Long categoryId, String categoryName, Long createdById,
		String createdByName, TransactionType type, BigDecimal amount, String description, LocalDate date,
		LocalDateTime createdAt) {
}
