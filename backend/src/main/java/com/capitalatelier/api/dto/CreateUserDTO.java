package com.capitalatelier.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserDTO(
    @NotBlank(message = "O nome de usuário não pode ser vazio!")
    @Size(min = 3, max = 50, message = "O nome de usuário deve ter entre 3 e 50 caracteres!")
    String username,

    @NotBlank(message = "O email não pode ser vazio!")
    @Email(message = "O email é inválido!")
    String email,

    @NotBlank(message = "A senha não pode ser vazia!")
    @Size(min = 6, max = 100, message = "A senha deve ter entre 6 e 100 caracteres!")
    String password
) {}
