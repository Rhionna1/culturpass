package com.culturpass.backend.repository;

import com.culturpass.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

// Provides database operations for the users table
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Find a user by their email address
    Optional<User> findByEmail(String email);

    // Check if an email is already registered
    boolean existsByEmail(String email);
}