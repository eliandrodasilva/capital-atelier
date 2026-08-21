package com.capitalatelier.api.dto;

import jakarta.validation.constraints.NotBlank;

public record WalletRequestDTO(
    @NotBlank(message = "O nome da carteira não pode ser vazio")
    String name,

    String description
) {}
