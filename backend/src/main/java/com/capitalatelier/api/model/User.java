package com.capitalatelier.api.model;

import java.time.LocalDate;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.validator.constraints.br.CPF;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome de usuário não pode ser vazio!")
    @Size(min = 3, max = 50, message = "O nome de usuário deve ter entre 3 e 50 caracteres!")
    private String username;

    @NotBlank(message = "O email não pode ser vazio!")
    @Email(message = "O email é inválido!")
    private String email;

    @NotBlank(message = "A senha não pode ser vazia!")
    @Size(min = 6, max = 100, message = "A senha deve ter entre 6 e 100 caracteres!")
    private String encryptedPassword;

    @CPF(message = "O CPF é inválido!")
    @NotBlank(message = "O CPF não pode ser vazio!")
    private String cpf;

    private String avatarUrl;

    @CreationTimestamp
    private LocalDate createdAt;

    @UpdateTimestamp
    private LocalDate updatedAt;
}
