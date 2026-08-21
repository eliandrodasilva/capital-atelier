package com.capitalatelier.api.dto;

public record ForgotPasswordResponseDTO(
    String message,
    String debugToken
) {}
