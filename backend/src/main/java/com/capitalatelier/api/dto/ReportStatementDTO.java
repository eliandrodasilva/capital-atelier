package com.capitalatelier.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReportStatementDTO(String walletName, LocalDate startDate, LocalDate endDate, BigDecimal totalIncome,
		BigDecimal totalExpense, BigDecimal balance, long transactionCount, List<CategorySummaryDTO> byCategory,
		List<TransactionResponseDTO> transactions) {
}
