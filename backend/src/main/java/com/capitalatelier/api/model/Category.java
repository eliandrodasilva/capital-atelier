package com.capitalatelier.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import com.capitalatelier.api.enums.TransactionType;

@Entity
@Table(name = "categories")
@Data
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne()
    @JoinColumn(name = "user_id")
    @NotNull(message = "O usuário da categoria é obrigatório")
    private User user;

    @NotBlank(message = "O nome da categoria não pode ser vazio")
    @Size(min = 3, max = 80, message = "O nome da categoria deve ter entre 3 e 80 caracteres")
    private String name;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "O tipo da categoria é obrigatório")
    private TransactionType type;

    @NotBlank
    @Pattern(regexp = "#[0-9A-Fa-f]{6}$")
    @Column(length = 7)
    private String color;
}
