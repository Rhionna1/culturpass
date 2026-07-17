package com.culturpass.backend.repository;

import com.culturpass.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

// Provides database operations for the users table
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Find a user by their email address
    Optional<User> findByEmail(String email);

    // Check if an email is already registered
    boolean existsByEmail(String email);

    // Search users by display name or email — used for admin event organizer reassignment
    List<User> findByDisplayNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String displayName, String email);
}