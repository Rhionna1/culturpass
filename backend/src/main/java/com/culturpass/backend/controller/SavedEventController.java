package com.culturpass.backend.controller;

import com.culturpass.backend.model.SavedEvent;
import com.culturpass.backend.service.SavedEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

// Handles all HTTP requests for saving and unsaving events
@RestController
@RequestMapping("/api/saved")
@RequiredArgsConstructor
public class SavedEventController {

    private final SavedEventService savedEventService;

    // GET /api/saved/user/{userId} — get all saved events for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedEvent>> getSavedEvents(@PathVariable UUID userId) {
        return ResponseEntity.ok(savedEventService.getSavedEventsByUser(userId));
    }

    // GET /api/saved/check/{userId}/{eventId} — check if an event is saved
    @GetMapping("/check/{userId}/{eventId}")
    public ResponseEntity<Map<String, Boolean>> isEventSaved(
            @PathVariable UUID userId,
            @PathVariable UUID eventId) {
        boolean saved = savedEventService.isEventSaved(userId, eventId);
        return ResponseEntity.ok(Map.of("saved", saved));
    }

    // POST /api/saved/{userId}/{eventId} — save an event
    @PostMapping("/{userId}/{eventId}")
    public ResponseEntity<SavedEvent> saveEvent(
            @PathVariable UUID userId,
            @PathVariable UUID eventId) {
        try {
            return ResponseEntity.ok(savedEventService.saveEvent(userId, eventId));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/saved/{userId}/{eventId} — unsave an event
    @DeleteMapping("/{userId}/{eventId}")
    public ResponseEntity<Void> unsaveEvent(
            @PathVariable UUID userId,
            @PathVariable UUID eventId) {
        try {
            savedEventService.unsaveEvent(userId, eventId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}