package com.culturpass.backend.service;

import com.culturpass.backend.model.Event;
import com.culturpass.backend.model.SavedEvent;
import com.culturpass.backend.model.User;
import com.culturpass.backend.repository.EventRepository;
import com.culturpass.backend.repository.SavedEventRepository;
import com.culturpass.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

// Handles all business logic for saving and unsaving events
@Service
@RequiredArgsConstructor
public class SavedEventService {

    private final SavedEventRepository savedEventRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    // Get all events saved by a specific user
    public List<SavedEvent> getSavedEventsByUser(UUID userId) {
        return savedEventRepository.findByUserId(userId);
    }

    // Check if a user has already saved a specific event
    public boolean isEventSaved(UUID userId, UUID eventId) {
        return savedEventRepository.existsByUserIdAndEventId(userId, eventId);
    }

    // Save an event for a user
    public SavedEvent saveEvent(UUID userId, UUID eventId) {

        // Check if already saved
        if (savedEventRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new IllegalStateException("Event is already saved");
        }

        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if event exists
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        // Save and return
        SavedEvent savedEvent = SavedEvent.builder()
                .user(user)
                .event(event)
                .build();

        return savedEventRepository.save(savedEvent);
    }

    // Unsave an event for a user
    public void unsaveEvent(UUID userId, UUID eventId) {
        SavedEvent savedEvent = savedEventRepository.findByUserIdAndEventId(userId, eventId)
                .orElseThrow(() -> new IllegalArgumentException("Saved event not found"));
        savedEventRepository.delete(savedEvent);
    }
}