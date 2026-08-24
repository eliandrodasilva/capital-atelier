package com.capitalatelier.api.dto;

import java.math.BigDecimal;

public record CategorySummaryDTO(
    Long categoryId,
    String categoryName,
    BigDecimal total
) {}
