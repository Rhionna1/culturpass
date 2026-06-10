package com.culturpass.backend.controller;

import com.culturpass.backend.model.Rsvp;
import com.culturpass.backend.service.RsvpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

// Handles all incoming HTTP requests for RSVPs
@RestController
@RequestMapping("/api/rsvps")
@RequiredArgsConstructor
public class RsvpController {

    private final RsvpService rsvpService;

    // GET /api/rsvps/user/{userId} — get all RSVPs for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Rsvp>> getRsvpsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(rsvpService.getRsvpsByUser(userId));
    }

    // GET /api/rsvps/event/{eventId} — get all RSVPs for a specific event
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Rsvp>> getRsvpsByEvent(@PathVariable UUID eventId) {
        return ResponseEntity.ok(rsvpService.getRsvpsByEvent(eventId));
    }

    // POST /api/rsvps/{userId}/{eventId} — create a new RSVP
    @PostMapping("/{userId}/{eventId}")
    public ResponseEntity<Rsvp> createRsvp(
            @PathVariable UUID userId,
            @PathVariable UUID eventId) {
        try {
            Rsvp rsvp = rsvpService.createRsvp(userId, eventId);
            return ResponseEntity.ok(rsvp);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/rsvps/{userId}/{eventId} — cancel an RSVP
    @DeleteMapping("/{userId}/{eventId}")
    public ResponseEntity<Void> cancelRsvp(
            @PathVariable UUID userId,
            @PathVariable UUID eventId) {
        try {
            rsvpService.cancelRsvp(userId, eventId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}