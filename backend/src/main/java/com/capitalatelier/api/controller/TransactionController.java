package com.capitalatelier.api.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.capitalatelier.api.dto.TransactionRequestDTO;
import com.capitalatelier.api.dto.TransactionResponseDTO;
import com.capitalatelier.api.enums.TransactionType;
import com.capitalatelier.api.service.TransactionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/wallets/{walletId}/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping
    public ResponseEntity<Page<TransactionResponseDTO>> getTransactions(
            @PathVariable Long walletId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(page = 0, size = 20, sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(transactionService.getTransactions(
                walletId, type, categoryId, startDate, endDate, pageable
        ));
    }

    @PostMapping
    public ResponseEntity<TransactionResponseDTO> createTransaction(
            @PathVariable Long walletId,
            @Valid @RequestBody TransactionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.createTransaction(walletId, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> getTransaction(
            @PathVariable Long walletId,
            @PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransaction(walletId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> updateTransaction(
            @PathVariable Long walletId,
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequestDTO dto) {
        return ResponseEntity.ok(transactionService.updateTransaction(walletId, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long walletId,
            @PathVariable Long id) {
        transactionService.deleteTransaction(walletId, id);
        return ResponseEntity.noContent().build();
    }
}
