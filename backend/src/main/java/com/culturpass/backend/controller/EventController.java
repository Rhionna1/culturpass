package com.culturpass.backend.controller;

import com.culturpass.backend.model.Event;
import com.culturpass.backend.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

// Handles all incoming HTTP requests for events
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // GET /api/events — get all events
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    // GET /api/events/upcoming — get all upcoming events
    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    // GET /api/events/featured — get the featured hero event
    @GetMapping("/featured")
    public ResponseEntity<Event> getFeaturedEvent() {
        return eventService.getFeaturedEvent()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/events/search?keyword=jazz — search events by keyword
    @GetMapping("/search")
    public ResponseEntity<List<Event>> searchEvents(@RequestParam String keyword) {
        return ResponseEntity.ok(eventService.searchEvents(keyword));
    }

    // GET /api/events/{id} — get a single event by ID
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable UUID id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/events/category/{category} — get events by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Event>> getEventsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(eventService.getEventsByCategory(category));
    }

    // GET /api/events/category/{category}/upcoming — get upcoming events by category
    @GetMapping("/category/{category}/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEventsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(eventService.getUpcomingEventsByCategory(category));
    }

    // POST /api/events — create a new event
    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventService.saveEvent(event));
    }

    // PUT /api/events/{id} — update an event
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable UUID id, @RequestBody Event event) {
        if (!eventService.getEventById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        event.setId(id);
        return ResponseEntity.ok(eventService.saveEvent(event));
    }

    // DELETE /api/events/{id} — delete an event
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        if (!eventService.getEventById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}