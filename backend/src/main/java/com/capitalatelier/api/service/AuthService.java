package com.capitalatelier.api.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.capitalatelier.api.dto.LoginRequestDTO;
import com.capitalatelier.api.dto.LoginResponseDTO;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailSenderService mailSenderService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            MailSenderService mailSenderService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailSenderService = mailSenderService;
    }

    public LoginResponseDTO login(LoginRequestDTO dto) {

        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() ->
                        new RuntimeException("Email ou senha inválidos"));

        boolean passwordMatches = passwordEncoder.matches(
                dto.password(),
                user.getEncryptedPassword()
        );

        if (!passwordMatches) {
            throw new RuntimeException("Email ou senha inválidos");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponseDTO(
                token,
                user.getUsername(),
                user.getEmail()
        );
    }

    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("E-mail não encontrado"));

        String token = jwtService.generateToken(user);
        String resetLink = "http://localhost:5173/reset-password/" + token;

        org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();
        context.setVariable("name", user.getUsername());
        context.setVariable("resetLink", resetLink);

        mailSenderService.sendWelcomeMail(
                user.getEmail(),
                "Recuperação de Senha - Capital Atelier",
                "resetPasswordMail",
                context
        );
    }

    public void resetPassword(String token, String newPassword) {
        if (!jwtService.isTokenValid(token)) {
            throw new RuntimeException("Token inválido ou expirado");
        }

        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        user.setEncryptedPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}