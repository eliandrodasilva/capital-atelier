package com.capitalatelier.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
    @NotBlank(message = "O email não pode ser vazio!")
    @Email(message = "O email é inválido!")
    String email,

    @NotBlank(message = "A senha não pode ser vazia!")
    String password
) {}
