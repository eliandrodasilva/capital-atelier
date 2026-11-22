package com.capitalatelier.api.controller;

import com.capitalatelier.api.dto.ReportStatementDTO;
import com.capitalatelier.api.enums.TransactionType;
import com.capitalatelier.api.service.ReportService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/wallets/{walletId}/reports")
@CrossOrigin(origins = "*")
public class ReportController {

	private final ReportService reportService;

	public ReportController(ReportService reportService) {
		this.reportService = reportService;
	}

	@GetMapping("/statement")
	public ResponseEntity<ReportStatementDTO> getStatement(@PathVariable Long walletId,
			@RequestParam(required = false) TransactionType type, @RequestParam(required = false) Long categoryId,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
		return ResponseEntity.ok(reportService.getStatement(walletId, type, categoryId, startDate, endDate));
	}

	@GetMapping(value = "/export/csv", produces = "text/csv")
	public ResponseEntity<byte[]> exportCsv(@PathVariable Long walletId,
			@RequestParam(required = false) TransactionType type, @RequestParam(required = false) Long categoryId,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
		byte[] csvBytes = reportService.exportCsv(walletId, type, categoryId, startDate, endDate);

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(new MediaType("text", "csv", java.nio.charset.StandardCharsets.UTF_8));
		headers.setContentDisposition(
				ContentDisposition.attachment().filename("extrato-carteira-" + walletId + ".csv").build());

		return ResponseEntity.ok().headers(headers).body(csvBytes);
	}
}
