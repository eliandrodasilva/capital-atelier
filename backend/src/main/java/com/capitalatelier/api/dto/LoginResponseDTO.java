package com.capitalatelier.api.dto;

public record LoginResponseDTO(
    String token,
    String username,
    String email
) {}
