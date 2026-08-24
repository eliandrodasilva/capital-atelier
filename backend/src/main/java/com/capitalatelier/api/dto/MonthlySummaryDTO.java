package com.capitalatelier.api.dto;

import java.math.BigDecimal;

public record MonthlySummaryDTO(
    String month,
    BigDecimal income,
    BigDecimal expense
) {}
