package com.capitalatelier.api.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import com.capitalatelier.api.dto.ForgotPasswordResponseDTO;
import com.capitalatelier.api.dto.LoginRequestDTO;
import com.capitalatelier.api.dto.LoginResponseDTO;
import com.capitalatelier.api.dto.RegisterRequestDTO;
import com.capitalatelier.api.dto.RegisterResponseDTO;
import com.capitalatelier.api.model.PasswordResetToken;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.repository.PasswordResetTokenRepository;
import com.capitalatelier.api.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private MailSenderService mailSenderService;

    public RegisterResponseDTO register(RegisterRequestDTO dto) {
        if (userRepository.findByEmail(dto.email()).isPresent()) {
            throw new RuntimeException("O email informado já está cadastrado");
        }

        User user = new User();
        user.setUsername(dto.name());
        user.setEmail(dto.email());
        user.setEncryptedPassword(passwordEncoder.encode(dto.password()));

        User savedUser = userRepository.save(user);

        try {
            Context context = new Context();
            context.setVariable("name", savedUser.getUsername());
            context.setVariable("email", savedUser.getEmail());
            context.setVariable("createdAt", savedUser.getCreatedAt());
            context.setVariable("updatedAt", savedUser.getUpdatedAt());
            mailSenderService.sendWelcomeMail(savedUser.getEmail(), "Bem-vindo ao Capital Atelier", "newSignUp", context);
        } catch (Exception ignored) {
        }

        return new RegisterResponseDTO(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getCreatedAt()
        );
    }

    public LoginResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new RuntimeException("E-mail ou senha inválidos"));

        boolean passwordMatches = passwordEncoder.matches(
                dto.password(),
                user.getEncryptedPassword()
        );

        if (!passwordMatches) {
            throw new RuntimeException("E-mail ou senha inválidos");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponseDTO(
                token,
                "Bearer",
                86400L,
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }

    public ForgotPasswordResponseDTO forgotPassword(String email) {
        String debugToken = UUID.randomUUID().toString();
        String message = "Se este e-mail estiver cadastrado, você receberá as instruções em breve.";

        userRepository.findByEmail(email).ifPresent(user -> {
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(debugToken);
            resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));
            resetToken.setUsed(false);

            tokenRepository.save(resetToken);

            try {
                String resetLink = "http://localhost:5173/reset-password/" + debugToken;
                Context context = new Context();
                context.setVariable("name", user.getUsername());
                context.setVariable("resetLink", resetLink);

                mailSenderService.sendWelcomeMail(
                        user.getEmail(),
                        "Recuperação de Senha - Capital Atelier",
                        "resetPasswordMail",
                        context
                );
            } catch (Exception ignored) {
            }
        });

        return new ForgotPasswordResponseDTO(message, debugToken);
    }

    public void resetPassword(String token, String newPassword) {
        var optionalToken = tokenRepository.findByToken(token);
        if (optionalToken.isPresent()) {
            PasswordResetToken resetToken = optionalToken.get();
            if (resetToken.isUsed()) {
                throw new RuntimeException("Token já foi utilizado");
            }
            if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Token expirado");
            }
            User user = resetToken.getUser();
            user.setEncryptedPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            resetToken.setUsed(true);
            tokenRepository.save(resetToken);
            return;
        }

        if (jwtService.isTokenValid(token)) {
            String email = jwtService.extractEmail(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            user.setEncryptedPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return;
        }

        throw new RuntimeException("Token inválido ou expirado");
    }
}