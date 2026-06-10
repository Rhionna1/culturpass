package com.culturpass.backend.service;

import com.culturpass.backend.model.Rsvp;
import com.culturpass.backend.model.Event;
import com.culturpass.backend.model.User;
import com.culturpass.backend.repository.RsvpRepository;
import com.culturpass.backend.repository.EventRepository;
import com.culturpass.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Handles all business logic for RSVPs
@Service
@RequiredArgsConstructor
public class RsvpService {

    private final RsvpRepository rsvpRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    // Get all RSVPs for a specific user
    public List<Rsvp> getRsvpsByUser(UUID userId) {
        return rsvpRepository.findByUserId(userId);
    }

    // Get all RSVPs for a specific event
    public List<Rsvp> getRsvpsByEvent(UUID eventId) {
        return rsvpRepository.findByEventId(eventId);
    }

    // Create a new RSVP with business rule checks
    public Rsvp createRsvp(UUID userId, UUID eventId) {

        // Rule 1: Check if user has already RSVPed to this event
        if (rsvpRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new IllegalStateException("User has already RSVPed to this event");
        }

        // Rule 2: Check if the event exists
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        // Rule 3: Check if the event has already happened
        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Cannot RSVP to an event that has already passed");
        }

        // Rule 4: Check if the user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // All rules passed — create and save the RSVP
        Rsvp rsvp = Rsvp.builder()
                .user(user)
                .event(event)
                .status("going")
                .build();

        return rsvpRepository.save(rsvp);
    }

    // Cancel an RSVP
    public void cancelRsvp(UUID userId, UUID eventId) {
        Rsvp rsvp = rsvpRepository.findByUserIdAndEventId(userId, eventId)
                .orElseThrow(() -> new IllegalArgumentException("RSVP not found"));
        rsvpRepository.delete(rsvp);
    }
}