package com.culturpass.backend.controller;

import com.culturpass.backend.model.Complaint;
import com.culturpass.backend.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

// Handles all HTTP requests for complaints and contact form submissions
@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    // POST /api/complaints — submit a complaint from the contact modal
    @PostMapping
    public ResponseEntity<Complaint> submitComplaint(@RequestBody Map<String, Object> body) {
        try {
            List<String> types = (List<String>) body.get("types");
            String message = body.get("message") != null ? body.get("message").toString() : "";
            String submittedBy = body.get("submittedBy") != null ? body.get("submittedBy").toString() : "anonymous";
            return ResponseEntity.ok(complaintService.submitComplaint(types, message, submittedBy));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET /api/complaints — get all complaints (admin only)
    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    // GET /api/complaints/unreviewed — get unreviewed complaints (admin only)
    @GetMapping("/unreviewed")
    public ResponseEntity<List<Complaint>> getUnreviewedComplaints() {
        return ResponseEntity.ok(complaintService.getUnreviewedComplaints());
    }

    // GET /api/complaints/racism — get racism complaints (admin only)
    @GetMapping("/racism")
    public ResponseEntity<List<Complaint>> getRacismComplaints() {
        return ResponseEntity.ok(complaintService.getRacismComplaints());
    }

    // PUT /api/complaints/{id}/review — mark a complaint as reviewed
    @PutMapping("/{id}/review")
    public ResponseEntity<Complaint> reviewComplaint(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(complaintService.reviewComplaint(
                    id, body.get("adminNotes")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}