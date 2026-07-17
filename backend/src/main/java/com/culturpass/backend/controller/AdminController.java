package com.culturpass.backend.controller;

import com.culturpass.backend.model.Event;
import com.culturpass.backend.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

// Admin only endpoints — protected by role in Phase 2 security
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final EventService eventService;
    private final com.culturpass.backend.repository.EventRepository eventRepository;
    private final com.culturpass.backend.repository.UserRepository userRepository;

    // GET /api/admin/events/pending — get all events awaiting approval
    @GetMapping("/events/pending")
    public ResponseEntity<List<Event>> getPendingEvents() {
        return ResponseEntity.ok(eventService.getPendingEvents());
    }

    // PUT /api/admin/events/{id}/approve — approve an event
    @PutMapping("/events/{id}/approve")
    public ResponseEntity<Event> approveEvent(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(eventService.approveEvent(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PUT /api/admin/events/{id}/reject — reject an event
    @PutMapping("/events/{id}/reject")
    public ResponseEntity<Event> rejectEvent(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(eventService.rejectEvent(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PUT /api/admin/events/{id}/feature — set an event as the featured hero event
    @PutMapping("/events/{id}/feature")
    public ResponseEntity<Event> setFeaturedEvent(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(eventService.setFeaturedEvent(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PUT /api/admin/events/{id} — edit any event
    @PutMapping("/events/{id}")
    public ResponseEntity<?> editEvent(
            @PathVariable UUID id,
            @RequestBody Event updatedEvent) {
        try {
            return ResponseEntity.ok(eventService.editEvent(id, updatedEvent));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/admin/events/{id} — delete any event permanently
    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PUT /api/admin/events/{id}/reassign-organizer — reassign event to a different user
    // Used when a host creates an account after admin posted their event
    @PutMapping("/events/{id}/reassign-organizer")
    public ResponseEntity<?> reassignOrganizer(
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, String> body) {
        try {
            UUID newOrganizerId = UUID.fromString(body.get("organizerId"));
            Event event = eventRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Event not found"));
            userRepository.findById(newOrganizerId)
                    .ifPresent(event::setOrganizer);
            return ResponseEntity.ok(eventRepository.save(event));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}