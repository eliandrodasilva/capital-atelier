package com.capitalatelier.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.capitalatelier.api.dto.ChangePasswordDTO;
import com.capitalatelier.api.dto.CreateUserDTO;
import com.capitalatelier.api.dto.UpdateUserDTO;
import com.capitalatelier.api.dto.UserResponseDTO;
import com.capitalatelier.api.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin()
public class UserController {
    
    @Autowired
    private UserService service;

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody CreateUserDTO dto) {
        return new ResponseEntity<>(service.createUser(dto), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMe() {
        return ResponseEntity.ok(service.getMe());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateMe(@Valid @RequestBody UpdateUserDTO dto) {
        return ResponseEntity.ok(service.updateMe(dto));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordDTO dto) {
        service.changePasswordMe(dto);
        return ResponseEntity.ok().build();
    }
}
