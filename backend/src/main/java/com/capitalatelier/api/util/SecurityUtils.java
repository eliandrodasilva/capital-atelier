package com.capitalatelier.api.util;

import org.springframework.stereotype.Component;

import com.capitalatelier.api.model.User;
import com.capitalatelier.api.repository.UserRepository;
import com.capitalatelier.api.service.JwtService;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class SecurityUtils {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final HttpServletRequest request;

    public SecurityUtils(JwtService jwtService, UserRepository userRepository, HttpServletRequest request) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.request = request;
    }

    public User getAuthenticatedUser() {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token de autenticação ausente ou inválido");
        }

        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token)) {
            throw new RuntimeException("Token expirado ou inválido");
        }

        String email = jwtService.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado"));
    }
}
