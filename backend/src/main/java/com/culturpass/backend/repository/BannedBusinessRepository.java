package com.culturpass.backend.repository;

import com.culturpass.backend.model.BannedBusiness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Provides database operations for the banned_businesses table
@Repository
public interface BannedBusinessRepository extends JpaRepository<BannedBusiness, UUID> {

    // Get all active bans
    List<BannedBusiness> findByIsActiveTrueOrderByCreatedAtDesc();

    // Check if a business name is currently banned
    boolean existsByBusinessNameIgnoreCaseAndIsActiveTrue(String businessName);

    // Find a ban by business name
    Optional<BannedBusiness> findByBusinessNameIgnoreCaseAndIsActiveTrue(String businessName);
}