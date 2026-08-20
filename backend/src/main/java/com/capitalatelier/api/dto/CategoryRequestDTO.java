package com.capitalatelier.api.dto;

import com.capitalatelier.api.enums.TransactionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequestDTO(
    @NotBlank(message = "O nome da categoria não pode ser vazio")
    @Size(min = 3, max = 80, message = "O nome da categoria deve ter entre 3 e 80 caracteres")
    String name,

    @NotNull(message = "O tipo da categoria é obrigatório")
    TransactionType type,

    @NotBlank
    @Pattern(regexp = "#[0-9A-Fa-f]{6}$")
    String color
) {}
