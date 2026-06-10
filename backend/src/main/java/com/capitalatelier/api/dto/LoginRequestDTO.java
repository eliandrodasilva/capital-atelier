package com.capitalatelier.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequestDTO(

    @NotBlank(message = "O email não pode ser vazio!")
    @Email
    String email,

    @NotBlank(message = "A senha não pode ser vazia!")
    @Size(min = 6, max = 100)
    String password

) {}