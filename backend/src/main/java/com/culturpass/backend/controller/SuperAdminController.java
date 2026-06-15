package com.culturpass.backend.controller;

import com.culturpass.backend.model.User;
import com.culturpass.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

// Super Admin only endpoints — highest level of access
// Only the platform owner (Rhionna) has SUPER_ADMIN role
@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final UserRepository userRepository;

    // GET /api/super-admin/users — get all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // PUT /api/super-admin/users/{id}/role — promote or demote a user's role
    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return userRepository.findById(id)
                .map(user -> {
                    String newRole = body.get("role");
                    // Only allow valid roles
                    if (!List.of("USER", "ADMIN", "SUPER_ADMIN").contains(newRole)) {
                        return ResponseEntity.badRequest().<User>build();
                    }
                    user.setRole(newRole);
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/super-admin/users/{id}/ban — ban a user
    @PutMapping("/users/{id}/ban")
    public ResponseEntity<User> banUser(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setRole("BANNED");
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/super-admin/users/{id}/unban — unban a user
    @PutMapping("/users/{id}/unban")
    public ResponseEntity<User> unbanUser(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setRole("USER");
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}