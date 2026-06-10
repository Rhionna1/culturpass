package com.culturpass.backend.repository;

import com.culturpass.backend.model.Rsvp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Provides database operations for the rsvps table
@Repository
public interface RsvpRepository extends JpaRepository<Rsvp, UUID> {

    // Find all RSVPs made by a specific user
    List<Rsvp> findByUserId(UUID userId);

    // Find all RSVPs for a specific event
    List<Rsvp> findByEventId(UUID eventId);

    // Find a specific user's RSVP for a specific event
    Optional<Rsvp> findByUserIdAndEventId(UUID userId, UUID eventId);

    // Check if a user has already RSVPed to an event
    boolean existsByUserIdAndEventId(UUID userId, UUID eventId);
}