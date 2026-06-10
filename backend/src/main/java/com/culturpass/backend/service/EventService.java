package com.culturpass.backend.service;

import com.culturpass.backend.model.Event;
import com.culturpass.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Handles all business logic for events
@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    // Get all events
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // Get a single event by its ID
    public Optional<Event> getEventById(UUID id) {
        return eventRepository.findById(id);
    }

    // Get all events in a specific category
    public List<Event> getEventsByCategory(String category) {
        return eventRepository.findByCategory(category);
    }

    // Get all upcoming active events in a category
    public List<Event> getUpcomingEventsByCategory(String category) {
        return eventRepository.findByCategoryAndStatusAndEventDateAfter(
                category, "active", LocalDateTime.now()
        );
    }

    // Get all events organized by a specific user
    public List<Event> getEventsByOrganizer(UUID organizerId) {
        return eventRepository.findByOrganizerId(organizerId);
    }

    // Get all upcoming events
    public List<Event> getUpcomingEvents() {
        return eventRepository.findByEventDateAfter(LocalDateTime.now());
    }

    // Save a new event or update an existing one
    public Event saveEvent(Event event) {
        return eventRepository.save(event);
    }

    // Delete an event by its ID
    public void deleteEvent(UUID id) {
        eventRepository.deleteById(id);
    }
}