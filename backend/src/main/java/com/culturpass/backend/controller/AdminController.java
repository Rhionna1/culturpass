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
}