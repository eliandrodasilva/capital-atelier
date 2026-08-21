package com.capitalatelier.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
    @NotBlank(message = "O nome não pode ser vazio")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres")
    String name,

    @NotBlank(message = "O email não pode ser vazio")
    @Email(message = "O email é inválido")
    String email,

    @NotBlank(message = "A senha não pode ser vazia")
    @Size(min = 6, max = 100, message = "A senha deve ter pelo menos 6 caracteres")
    String password
) {}
