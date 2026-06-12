package com.culturpass.backend.service;

import com.culturpass.backend.model.User;
import com.culturpass.backend.repository.UserRepository;
import com.culturpass.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// Handles registration and login business logic
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // Register a new user
    public String register(String email, String password, String displayName) {

        // Check if email is already taken
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("An account with this email already exists");
        }

        // Hash the password before saving
        String hashedPassword = passwordEncoder.encode(password);

        // Build and save the user
        User user = User.builder()
                .email(email)
                .passwordHash(hashedPassword)
                .displayName(displayName)
                .role("USER")
                .build();

        userRepository.save(user);

        // Return a JWT token so they're logged in immediately after registering
        return jwtUtil.generateToken(email, "USER");
    }

    // Log in an existing user
    public String login(String email, String password) {

        // Find the user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Check the password matches
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Return a JWT token
        return jwtUtil.generateToken(email, user.getRole());
    }
}