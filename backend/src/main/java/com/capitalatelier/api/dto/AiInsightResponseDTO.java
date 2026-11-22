package com.capitalatelier.api.dto;

import java.util.List;

public record AiInsightResponseDTO(String summary, List<String> highlights, String recommendation, String model) {
}
