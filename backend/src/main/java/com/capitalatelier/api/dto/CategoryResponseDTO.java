package com.capitalatelier.api.dto;

import com.capitalatelier.api.enums.TransactionType;

public record CategoryResponseDTO(
    Long id,
    String name,
    TransactionType type,
    String color
) {}
