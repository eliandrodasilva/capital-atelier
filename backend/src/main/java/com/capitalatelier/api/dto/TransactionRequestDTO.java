package com.capitalatelier.api.dto;

import com.capitalatelier.api.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequestDTO(@NotNull(message = "O tipo da transação é obrigatório") TransactionType type,

		@NotNull(message = "O valor é obrigatório") @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero") BigDecimal amount,

		String description,

		@NotNull(message = "A data é obrigatória") LocalDate date,

		Long categoryId) {
}
