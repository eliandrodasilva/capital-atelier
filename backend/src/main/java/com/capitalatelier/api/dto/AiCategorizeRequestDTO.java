package com.capitalatelier.api.dto;

import com.capitalatelier.api.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AiCategorizeRequestDTO(
		@NotBlank(message = "A descrição é obrigatória") String description,
		@NotNull(message = "O tipo é obrigatório") TransactionType type) {
}
