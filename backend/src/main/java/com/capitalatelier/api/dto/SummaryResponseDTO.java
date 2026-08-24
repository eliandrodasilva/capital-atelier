package com.capitalatelier.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record SummaryResponseDTO(
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal balance,
    long transactionCount,
    List<CategorySummaryDTO> byCategory,
    List<MonthlySummaryDTO> byMonth
) {}
