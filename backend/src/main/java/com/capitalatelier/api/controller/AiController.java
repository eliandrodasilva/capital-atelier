package com.capitalatelier.api.controller;

import com.capitalatelier.api.dto.AiCategorizeRequestDTO;
import com.capitalatelier.api.dto.AiCategorizeResponseDTO;
import com.capitalatelier.api.dto.AiInsightRequestDTO;
import com.capitalatelier.api.dto.AiInsightResponseDTO;
import com.capitalatelier.api.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/wallets/{walletId}/ai")
@CrossOrigin(origins = "*")
public class AiController {

	private final AiService aiService;

	public AiController(AiService aiService) {
		this.aiService = aiService;
	}

	@PostMapping("/insights")
	public ResponseEntity<AiInsightResponseDTO> generateInsights(@PathVariable Long walletId,
			@RequestBody(required = false) AiInsightRequestDTO dto) {
		AiInsightRequestDTO request = dto != null ? dto : new AiInsightRequestDTO(null, null);
		return ResponseEntity
				.ok(aiService.generateInsights(walletId, request.startDate(), request.endDate()));
	}

	@PostMapping("/categorize")
	public ResponseEntity<AiCategorizeResponseDTO> suggestCategory(@PathVariable Long walletId,
			@Valid @RequestBody AiCategorizeRequestDTO dto) {
		return ResponseEntity.ok(aiService.suggestCategory(walletId, dto));
	}
}
