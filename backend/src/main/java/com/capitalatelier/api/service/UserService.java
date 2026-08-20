package com.capitalatelier.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import com.capitalatelier.api.dto.ChangePasswordDTO;
import com.capitalatelier.api.dto.CreateUserDTO;
import com.capitalatelier.api.dto.UpdateUserDTO;
import com.capitalatelier.api.dto.UserResponseDTO;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.repository.UserRepository;
import com.capitalatelier.api.util.SecurityUtils;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private MailSenderService mailSenderService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SecurityUtils securityUtils;

    public UserResponseDTO createUser(CreateUserDTO dto) {
        if (repository.findByEmail(dto.email()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        User user = new User();
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setEncryptedPassword(passwordEncoder.encode(dto.password()));

        User savedUser = repository.save(user);

        Context context = new Context();
        context.setVariable("name", savedUser.getUsername());
        context.setVariable("email", savedUser.getEmail());
        context.setVariable("createdAt", savedUser.getCreatedAt());
        context.setVariable("updatedAt", savedUser.getUpdatedAt());

        mailSenderService.sendWelcomeMail(savedUser.getEmail(), "Bem-vindo ao Capital Atelier", "newSignUp", context);

        return toDTO(savedUser);
    }

    public UserResponseDTO getMe() {
        User user = securityUtils.getAuthenticatedUser();
        return toDTO(user);
    }

    public UserResponseDTO updateMe(UpdateUserDTO dto) {
        User user = securityUtils.getAuthenticatedUser();
        if (dto.username() != null && !dto.username().isBlank()) {
            user.setUsername(dto.username());
            user = repository.save(user);
        }
        return toDTO(user);
    }

    public void changePasswordMe(ChangePasswordDTO dto) {
        User user = securityUtils.getAuthenticatedUser();
        if (!passwordEncoder.matches(dto.currentPassword(), user.getEncryptedPassword())) {
            throw new RuntimeException("A senha atual informada está incorreta");
        }
        user.setEncryptedPassword(passwordEncoder.encode(dto.newPassword()));
        repository.save(user);
    }

    private UserResponseDTO toDTO(User user) {
        return new UserResponseDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}