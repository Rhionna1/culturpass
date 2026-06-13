package com.culturpass.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

// This class maps directly to the events table in our PostgreSQL database
@Entity
@Table(name = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String category;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "external_id")
    private String externalId;

    @Builder.Default
    private String source = "user";

    @Column(name = "ticket_url")
    private String ticketUrl;

    // Optional deadline for purchasing tickets
    @Column(name = "ticket_deadline")
    private LocalDateTime ticketDeadline;

    @Column(name = "price_min")
    private BigDecimal priceMin;

    @Column(name = "price_max")
    private BigDecimal priceMax;

    @Column(name = "is_free")
    @Builder.Default
    private Boolean isFree = false;

    private Integer capacity;

    @Builder.Default
    private String status = "active";

    // Whether this event is featured in the hero section — admin only
    @Builder.Default
    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    // Event type — 'event' for regular events, 'happyhour' for permanent happy hour listings
    @Builder.Default
    @Column(name = "event_type")
    private String eventType = "event";

    // Happy Hour specific fields
    @Column(name = "business_name")
    private String businessName;

    @Column(name = "happy_hour_days")
    private String happyHourDays;

    @Column(name = "happy_hour_start")
    private String happyHourStart;

    @Column(name = "happy_hour_end")
    private String happyHourEnd;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}