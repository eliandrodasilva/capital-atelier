package com.capitalatelier.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.capitalatelier.api.dto.LoginRequestDTO;
import com.capitalatelier.api.dto.LoginResponseDTO;
import com.capitalatelier.api.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin()
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO dto) {

        LoginResponseDTO response = authService.login(dto);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @Valid @RequestBody com.capitalatelier.api.dto.ForgotPasswordRequestDTO dto) {

        authService.sendPasswordResetEmail(dto.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(
            @Valid @RequestBody com.capitalatelier.api.dto.ResetPasswordRequestDTO dto) {

        authService.resetPassword(dto.token(), dto.newPassword());
        return ResponseEntity.ok().build();
    }
}