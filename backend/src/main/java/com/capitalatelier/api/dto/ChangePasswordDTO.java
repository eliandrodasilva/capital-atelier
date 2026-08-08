package com.capitalatelier.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordDTO(
    @NotBlank(message = "A senha atual é obrigatória")
    String oldPassword,

    @NotBlank(message = "A nova senha é obrigatória")
    @Size(min = 6, max = 100, message = "A nova senha deve ter entre 6 e 100 caracteres")
    String newPassword
) {}
