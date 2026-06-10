package com.capitalatelier.api.dto;

import java.time.LocalDate;

public record UserResponseDTO(

    Long id,
    String username,
    String email,
    String cpf,
    String avatarUrl,
    LocalDate createdAt,
    LocalDate updatedAt

) {}