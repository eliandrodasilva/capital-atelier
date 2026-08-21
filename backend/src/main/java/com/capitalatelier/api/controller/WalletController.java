package com.capitalatelier.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.RestController;

import com.capitalatelier.api.dto.WalletRequestDTO;
import com.capitalatelier.api.dto.WalletResponseDTO;
import com.capitalatelier.api.service.WalletService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/wallets")
@CrossOrigin(origins = "*")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping
    public ResponseEntity<List<WalletResponseDTO>> getWallets() {
        return ResponseEntity.ok(walletService.getWallets());
    }

    @PostMapping
    public ResponseEntity<WalletResponseDTO> createWallet(
            @Valid @RequestBody WalletRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(walletService.createWallet(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WalletResponseDTO> getWallet(@PathVariable Long id) {
        return ResponseEntity.ok(walletService.getWallet(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WalletResponseDTO> updateWallet(
            @PathVariable Long id, @Valid @RequestBody WalletRequestDTO dto) {
        return ResponseEntity.ok(walletService.updateWallet(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWallet(@PathVariable Long id) {
        walletService.deleteWallet(id);
        return ResponseEntity.noContent().build();
    }
}
