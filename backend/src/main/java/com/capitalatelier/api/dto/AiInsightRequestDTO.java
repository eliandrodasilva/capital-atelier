package com.capitalatelier.api.dto;

import java.time.LocalDate;

public record AiInsightRequestDTO(LocalDate startDate, LocalDate endDate) {
}
