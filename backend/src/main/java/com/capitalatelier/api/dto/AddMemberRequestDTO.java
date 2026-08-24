package com.capitalatelier.api.dto;

import com.capitalatelier.api.enums.WalletRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddMemberRequestDTO(
    @NotBlank(message = "O email é obrigatório")
    @Email(message = "O email é inválido")
    String email,

    @NotNull(message = "O papel do membro é obrigatório")
    WalletRole role
) {}
