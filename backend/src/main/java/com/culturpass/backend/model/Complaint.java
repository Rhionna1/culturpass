package com.culturpass.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

// Stores contact form submissions and complaints from users
@Entity
@Table(name = "complaints")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // The selected reason(s) from the contact modal checkboxes
    @Column(name = "complaint_types", columnDefinition = "TEXT")
    private String complaintTypes;

    // The user's message
    @Column(columnDefinition = "TEXT")
    private String message;

    // Email of the user who submitted — null if not logged in
    @Column(name = "submitted_by")
    private String submittedBy;

    // Whether this complaint has been reviewed by an admin
    @Builder.Default
    private Boolean reviewed = false;

    // Admin notes on this complaint
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    // Flag for racism complaints — makes them easy to filter
    @Builder.Default
    @Column(name = "is_racism_complaint")
    private Boolean isRacismComplaint = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}