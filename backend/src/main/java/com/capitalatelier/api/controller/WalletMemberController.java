package com.capitalatelier.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.capitalatelier.api.dto.AddMemberRequestDTO;
import com.capitalatelier.api.dto.UpdateMemberRoleDTO;
import com.capitalatelier.api.dto.WalletMemberResponseDTO;
import com.capitalatelier.api.service.WalletService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/wallets/{walletId}/members")
@CrossOrigin(origins = "*")
public class WalletMemberController {

    @Autowired
    private WalletService walletService;

    @GetMapping
    public ResponseEntity<List<WalletMemberResponseDTO>> getMembers(@PathVariable Long walletId) {
        return ResponseEntity.ok(walletService.getMembers(walletId));
    }

    @PostMapping
    public ResponseEntity<WalletMemberResponseDTO> addMember(
            @PathVariable Long walletId, @Valid @RequestBody AddMemberRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(walletService.addMember(walletId, dto));
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<WalletMemberResponseDTO> updateMemberRole(
            @PathVariable Long walletId, @PathVariable Long userId, @Valid @RequestBody UpdateMemberRoleDTO dto) {
        return ResponseEntity.ok(walletService.updateMemberRole(walletId, userId, dto));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long walletId, @PathVariable Long userId) {
        walletService.removeMember(walletId, userId);
        return ResponseEntity.noContent().build();
    }
}
