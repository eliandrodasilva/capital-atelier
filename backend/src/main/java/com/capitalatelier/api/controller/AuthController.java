package com.capitalatelier.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.capitalatelier.api.dto.LoginRequestDTO;
import com.capitalatelier.api.dto.LoginResponseDTO;
import com.capitalatelier.api.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
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
}