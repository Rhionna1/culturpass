package com.culturpass.backend.service;

import com.culturpass.backend.model.User;
import com.culturpass.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Handles all business logic for users
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get a single user by their ID
    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    // Get a single user by their email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Check if an email is already taken
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // Save a new user or update an existing one
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Delete a user by their ID
    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }
}