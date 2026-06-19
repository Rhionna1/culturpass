package com.culturpass.backend.service;

import com.culturpass.backend.model.Event;
import com.culturpass.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.culturpass.backend.model.Location;
import com.culturpass.backend.repository.LocationRepository;

// Handles all business logic for events
@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final LocationRepository locationRepository;

    // Get all active events only — pending and rejected are hidden from public
    // Get all active upcoming events plus permanent Happy Hour listings
    public List<Event> getAllEvents() {
        List<Event> upcomingEvents = eventRepository.findByStatusAndEventDateAfter("active", LocalDateTime.now());
        List<Event> happyHours = eventRepository.findByStatusAndEventType("active", "happyhour");
        upcomingEvents.addAll(happyHours);
        return upcomingEvents;
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

    // Get all upcoming ACTIVE events only
    public List<Event> getUpcomingEvents() {
        return eventRepository.findByStatusAndEventDateAfter("active", LocalDateTime.now());
    }

    // Save a new event — new events default to pending approval
    // Validates multi-day events: consecutive only, max 7 days, Happy Hour exempt
    public Event saveEvent(Event event) {
        if (event.getId() == null) {
            event.setStatus("pending");
        }
        validateEventDuration(event);
        return eventRepository.save(event);
    }

    // Validates that multi-day events don't exceed 7 days
    // Happy Hour events are exempt since they don't use start/end dates the same way
    private void validateEventDuration(Event event) {
        if ("happyhour".equals(event.getEventType())) {
            return;
        }
        if (event.getEventDate() != null && event.getEndDate() != null) {
            if (event.getEndDate().isBefore(event.getEventDate())) {
                throw new IllegalArgumentException("End date cannot be before the start date");
            }
            long daysBetween = java.time.Duration.between(
                    event.getEventDate(), event.getEndDate()
            ).toDays();
            if (daysBetween > 7) {
                throw new IllegalArgumentException("Events cannot run longer than 7 days");
            }
        }
    }

    // Find or create a location record — prevents duplicate venues
    public Location findOrCreateLocation(String name, String address, String city, String state) {
        // Check if a location with this address already exists
        return locationRepository.findAll().stream()
                .filter(loc -> loc.getAddress() != null &&
                        loc.getAddress().equalsIgnoreCase(address) &&
                        loc.getCity().equalsIgnoreCase(city))
                .findFirst()
                .orElseGet(() -> {
                    // Create a new location record
                    Location newLocation = Location.builder()
                            .name(name)
                            .address(address)
                            .city(city)
                            .state(state != null ? state : "")
                            .build();
                    return locationRepository.save(newLocation);
                });
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

    // Admin only — edit any event's details
    public Event editEvent(UUID id, Event updatedEvent) {
        // Find the existing event
        Event existing = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        // Update only the fields that were provided
        if (updatedEvent.getTitle() != null) existing.setTitle(updatedEvent.getTitle());
        if (updatedEvent.getDescription() != null) existing.setDescription(updatedEvent.getDescription());
        if (updatedEvent.getCategory() != null) existing.setCategory(updatedEvent.getCategory());
        if (updatedEvent.getEventDate() != null) existing.setEventDate(updatedEvent.getEventDate());
        if (updatedEvent.getEndDate() != null) existing.setEndDate(updatedEvent.getEndDate());
        if (updatedEvent.getImageUrl() != null) existing.setImageUrl(updatedEvent.getImageUrl());
        if (updatedEvent.getTicketUrl() != null) existing.setTicketUrl(updatedEvent.getTicketUrl());
        if (updatedEvent.getTicketDeadline() != null) existing.setTicketDeadline(updatedEvent.getTicketDeadline());
        if (updatedEvent.getPriceMin() != null) existing.setPriceMin(updatedEvent.getPriceMin());
        if (updatedEvent.getPriceMax() != null) existing.setPriceMax(updatedEvent.getPriceMax());
        if (updatedEvent.getIsFree() != null) existing.setIsFree(updatedEvent.getIsFree());
        if (updatedEvent.getStatus() != null) existing.setStatus(updatedEvent.getStatus());
        if (updatedEvent.getBusinessName() != null) existing.setBusinessName(updatedEvent.getBusinessName());
        if (updatedEvent.getHappyHourDays() != null) existing.setHappyHourDays(updatedEvent.getHappyHourDays());
        if (updatedEvent.getHappyHourStart() != null) existing.setHappyHourStart(updatedEvent.getHappyHourStart());
        if (updatedEvent.getHappyHourEnd() != null) existing.setHappyHourEnd(updatedEvent.getHappyHourEnd());

        validateEventDuration(existing);
        return eventRepository.save(existing);
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