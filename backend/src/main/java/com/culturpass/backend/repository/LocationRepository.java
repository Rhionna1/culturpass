package com.culturpass.backend.repository;

import com.culturpass.backend.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Provides database operations for the locations table
@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {

    // Find a location by its Google Place ID
    Optional<Location> findByGooglePlaceId(String googlePlaceId);

    // Find all locations in a specific city
    List<Location> findByCity(String city);

    // Find all locations in a specific city and state
    List<Location> findByCityAndState(String city, String state);
}