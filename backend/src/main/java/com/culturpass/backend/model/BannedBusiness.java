package com.culturpass.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// Represents a business banned from the FunctionPass platform by Super Admin
@Entity
@Table(name = "banned_businesses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannedBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // The name of the banned business
    @Column(name = "business_name")
    private String businessName;

    // Optional link to the location record
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    // Reason for the ban — required for accountability
    private String reason;

    // Email of the Super Admin who issued the ban
    @Column(name = "banned_by")
    private String bannedBy;

    // Whether the ban is currently active — false means business was unbanned
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}