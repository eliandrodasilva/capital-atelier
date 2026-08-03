package com.capitalatelier.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import com.capitalatelier.api.dto.CreateUserDTO;
import com.capitalatelier.api.dto.UserResponseDTO;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private MailSenderService mailSenderService;

    public UserResponseDTO createUser(CreateUserDTO dto) {
        User user = new User();

        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setEncryptedPassword(new BCryptPasswordEncoder().encode(dto.password()));

        User savedUser = repository.save(user);

        Context context = new Context();
        
        context.setVariable("name", user.getUsername());
        context.setVariable("email", user.getEmail());
        context.setVariable("createdAt", user.getCreatedAt());
        context.setVariable("updatedAt", user.getUpdatedAt());
        
        mailSenderService.sendWelcomeMail(user.getEmail(), "Bem-vindo ao Capital Atelier", "newSignUp", context);

        return toDTO(savedUser);
    }

    public UserResponseDTO toDTO(User user) {
        return new UserResponseDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
