package com.culturpass.backend.repository;

import com.culturpass.backend.model.SavedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Provides database operations for the saved_events table
@Repository
public interface SavedEventRepository extends JpaRepository<SavedEvent, UUID> {

    // Find all events saved by a specific user
    List<SavedEvent> findByUserId(UUID userId);

    // Find all users who saved a specific event
    List<SavedEvent> findByEventId(UUID eventId);

    // Find a specific user's saved event
    Optional<SavedEvent> findByUserIdAndEventId(UUID userId, UUID eventId);

    // Check if a user has already saved an event
    boolean existsByUserIdAndEventId(UUID userId, UUID eventId);
}