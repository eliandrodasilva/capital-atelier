package com.capitalatelier.api.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.capitalatelier.api.dto.SummaryResponseDTO;
import com.capitalatelier.api.service.SummaryService;

@RestController
@RequestMapping("/api/wallets/{walletId}/summary")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private SummaryService summaryService;

    @GetMapping
    public ResponseEntity<SummaryResponseDTO> getSummary(
            @PathVariable Long walletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(summaryService.getSummary(walletId, startDate, endDate));
    }
}
