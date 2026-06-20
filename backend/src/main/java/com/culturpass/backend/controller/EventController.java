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
    // Accepts location fields separately and creates/reuses a location record
    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody java.util.Map<String, Object> body) {
        try {
            // Extract event fields
            Event event = new Event();
            if (body.get("title") != null) event.setTitle(body.get("title").toString());
            if (body.get("description") != null) event.setDescription(body.get("description").toString());
            if (body.get("category") != null) event.setCategory(body.get("category").toString());
            if (body.get("source") != null) event.setSource(body.get("source").toString());
            if (body.get("ticketUrl") != null) event.setTicketUrl(body.get("ticketUrl").toString());
            if (body.get("imageUrl") != null) event.setImageUrl(body.get("imageUrl").toString());
            if (body.get("isFree") != null) event.setIsFree((Boolean) body.get("isFree"));
            if (body.get("eventType") != null) event.setEventType(body.get("eventType").toString());
            if (body.get("businessName") != null) event.setBusinessName(body.get("businessName").toString());
            if (body.get("happyHourDays") != null) event.setHappyHourDays(body.get("happyHourDays").toString());
            if (body.get("happyHourStart") != null) event.setHappyHourStart(body.get("happyHourStart").toString());
            if (body.get("happyHourEnd") != null) event.setHappyHourEnd(body.get("happyHourEnd").toString());

            // Parse price fields
            if (body.get("priceMin") != null)
                event.setPriceMin(new java.math.BigDecimal(body.get("priceMin").toString()));
            if (body.get("priceMax") != null)
                event.setPriceMax(new java.math.BigDecimal(body.get("priceMax").toString()));

            // Parse event date
            if (body.get("eventDate") != null) {
                event.setEventDate(java.time.LocalDateTime.parse(body.get("eventDate").toString()));
            }

            // Parse end date — for multi-day events
            if (body.get("endDate") != null && !body.get("endDate").toString().isEmpty()) {
                event.setEndDate(java.time.LocalDateTime.parse(body.get("endDate").toString()));
            }

            // Parse ticket deadline
            if (body.get("ticketDeadline") != null && !body.get("ticketDeadline").toString().isEmpty()) {
                event.setTicketDeadline(java.time.LocalDateTime.parse(body.get("ticketDeadline").toString()));
            }

            // Handle location — find or create
            String venueName = body.get("venueName") != null ? body.get("venueName").toString() : null;
            String address = body.get("address") != null ? body.get("address").toString() : null;
            String city = body.get("city") != null ? body.get("city").toString() : null;
            String state = body.get("state") != null ? body.get("state").toString() : null;
            String zipCode = body.get("zipCode") != null ? body.get("zipCode").toString() : null;

            if (venueName != null && address != null && city != null) {
                com.culturpass.backend.model.Location location =
                        eventService.findOrCreateLocation(venueName, address, city, state, zipCode);
                event.setLocation(location);
            }

            return ResponseEntity.ok(eventService.saveEvent(event));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
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