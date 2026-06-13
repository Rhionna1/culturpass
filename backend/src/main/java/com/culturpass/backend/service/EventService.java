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

    // Get all active events only — pending and rejected are hidden from public
    // Get all active upcoming events only — past, pending and rejected are hidden from public
    public List<Event> getAllEvents() {
        return eventRepository.findByStatusAndEventDateAfter("active", LocalDateTime.now());
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

    // Save a new event — new events default to pending approval
    public Event saveEvent(Event event) {
        if (event.getId() == null) {
            event.setStatus("pending");
        }
        return eventRepository.save(event);
    }

    // Delete an event by its ID
    public void deleteEvent(UUID id) {
        eventRepository.deleteById(id);
    }

    // Admin only — approve an event
    public Event approveEvent(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        event.setStatus("active");
        return eventRepository.save(event);
    }

    // Admin only — reject an event
    public Event rejectEvent(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        event.setStatus("rejected");
        return eventRepository.save(event);
    }

    // Admin only — get all pending events awaiting approval
    public List<Event> getPendingEvents() {
        return eventRepository.findByStatus("pending");
    }

    // Get the currently featured event for the hero section
    public Optional<Event> getFeaturedEvent() {
        return eventRepository.findByIsFeaturedTrue();
    }

    // Admin only — set an event as the featured hero event
    public Event setFeaturedEvent(UUID id) {
        // First unfeatured any currently featured event
        eventRepository.findByIsFeaturedTrue().ifPresent(event -> {
            event.setIsFeatured(false);
            eventRepository.save(event);
        });

        // Then feature the new event
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        event.setIsFeatured(true);
        return eventRepository.save(event);
    }

    // Search events by keyword
    public List<Event> searchEvents(String keyword) {
        return eventRepository.searchByKeyword(keyword);
    }
}