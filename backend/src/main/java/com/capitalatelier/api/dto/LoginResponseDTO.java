package com.capitalatelier.api.dto;

public record LoginResponseDTO(
    String accessToken,
    String tokenType,
    Long expiresIn,
    String token,
    Long id,
    String username,
    String email
) {}
