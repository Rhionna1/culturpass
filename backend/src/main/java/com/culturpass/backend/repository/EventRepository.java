package com.culturpass.backend.repository;

import com.culturpass.backend.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Provides database operations for the events table
@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    // Find all events in a specific category
    List<Event> findByCategory(String category);

    // Find all events by a specific organizer
    List<Event> findByOrganizerId(UUID organizerId);

    // Find all events at a specific location
    List<Event> findByLocationId(UUID locationId);

    // Find all events happening after a specific date
    List<Event> findByEventDateAfter(LocalDateTime date);

    // Find all events from an external source like Ticketmaster
    List<Event> findBySource(String source);

    // Find a specific Ticketmaster event by its external ID
    Optional<Event> findByExternalId(String externalId);

    // Find all active events in a category after a specific date
    List<Event> findByCategoryAndStatusAndEventDateAfter(
            String category, String status, LocalDateTime date);

    // Find all events by status (active, pending, rejected)
    List<Event> findByStatus(String status);

    // Find the currently featured event for the hero section
    Optional<Event> findByIsFeaturedTrue();

    // Search events by title or description containing a keyword
    @Query("SELECT e FROM Event e WHERE e.status = 'active' AND " +
            "(LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Event> searchByKeyword(@Param("keyword") String keyword);
}