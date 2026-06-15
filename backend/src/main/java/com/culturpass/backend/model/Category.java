package com.culturpass.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

// Represents an event category — stored in the database so admins can manage them dynamically
@Entity
@Table(name = "categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The category name — must be unique
    @Column(unique = true, nullable = false)
    private String name;

    // Soft delete flag — deleted categories are hidden but not permanently removed
    @Builder.Default
    @Column(nullable = false)
    private Boolean deleted = false;

    // Display order for the category pills
    @Builder.Default
    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}