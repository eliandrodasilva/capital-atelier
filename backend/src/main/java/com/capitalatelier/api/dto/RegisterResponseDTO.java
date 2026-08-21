package com.capitalatelier.api.dto;

import java.time.LocalDateTime;

public record RegisterResponseDTO(
    Long id,
    String name,
    String email,
    LocalDateTime createdAt
) {}
