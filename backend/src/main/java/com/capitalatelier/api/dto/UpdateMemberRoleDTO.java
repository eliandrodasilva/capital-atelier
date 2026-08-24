package com.capitalatelier.api.dto;

import com.capitalatelier.api.enums.WalletRole;

import jakarta.validation.constraints.NotNull;

public record UpdateMemberRoleDTO(
    @NotNull(message = "O papel do membro é obrigatório")
    WalletRole role
) {}
