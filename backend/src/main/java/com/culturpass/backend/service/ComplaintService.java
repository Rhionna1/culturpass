package com.culturpass.backend.service;

import com.culturpass.backend.model.Complaint;
import com.culturpass.backend.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

// Handles all business logic for complaints and contact form submissions
@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;

    // Get all complaints — admin view
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    // Get only unreviewed complaints
    public List<Complaint> getUnreviewedComplaints() {
        return complaintRepository.findByReviewedFalseOrderByCreatedAtDesc();
    }

    // Get racism complaints — highest priority filter
    public List<Complaint> getRacismComplaints() {
        return complaintRepository.findByIsRacismComplaintTrueOrderByCreatedAtDesc();
    }

    // Submit a new complaint from the contact modal
    public Complaint submitComplaint(List<String> types, String message, String submittedBy) {
        // Check if any selected type is a racism complaint
        boolean isRacism = types.stream()
                .anyMatch(t -> t.toLowerCase().contains("racism"));

        // Join the selected types into a single string
        String complaintTypes = String.join(", ", types);

        Complaint complaint = Complaint.builder()
                .complaintTypes(complaintTypes)
                .message(message)
                .submittedBy(submittedBy)
                .reviewed(false)
                .isRacismComplaint(isRacism)
                .build();

        return complaintRepository.save(complaint);
    }

    // Mark a complaint as reviewed with admin notes
    public Complaint reviewComplaint(UUID id, String adminNotes) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found"));
        complaint.setReviewed(true);
        complaint.setAdminNotes(adminNotes);
        return complaintRepository.save(complaint);
    }
}