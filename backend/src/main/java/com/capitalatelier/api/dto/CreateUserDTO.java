package com.capitalatelier.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

public record CreateUserDTO(

    @NotBlank(message = "O nome de usuário não pode ser vazio!")
    @Size(min = 3, max = 50)
    String username,

    @NotBlank(message = "O email não pode ser vazio!")
    @Email(message = "O email é inválido!")
    String email,

    @NotBlank(message = "A senha não pode ser vazia!")
    @Size(min = 6, max = 100, message = "A senha deve ter entre 6 e 100 caracteres!")
    String password,

    @CPF
    @NotBlank(message = "O CPF não pode ser vazio!")
    String cpf,

    String avatarUrl

) {}