package com.culturpass.backend.service;

import com.culturpass.backend.model.BannedBusiness;
import com.culturpass.backend.model.Event;
import com.culturpass.backend.repository.BannedBusinessRepository;
import com.culturpass.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

// Handles all business logic for banning and unbanning businesses
@Service
@RequiredArgsConstructor
public class BannedBusinessService {

    private final BannedBusinessRepository bannedBusinessRepository;
    private final EventRepository eventRepository;

    // Get all currently active bans
    public List<BannedBusiness> getActiveBans() {
        return bannedBusinessRepository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    // Check if a business is currently banned
    public boolean isBusinessBanned(String businessName) {
        return bannedBusinessRepository.existsByBusinessNameIgnoreCaseAndIsActiveTrue(businessName);
    }

    // Ban a business — hides all their events and records the ban
    public BannedBusiness banBusiness(String businessName, String reason, String bannedBy) {
        // Check if already banned
        if (bannedBusinessRepository.existsByBusinessNameIgnoreCaseAndIsActiveTrue(businessName)) {
            throw new IllegalStateException("Business is already banned: " + businessName);
        }

        // Hide all events from this business
        List<Event> businessEvents = eventRepository.findByBusinessName(businessName);
        businessEvents.forEach(event -> {
            event.setStatus("rejected");
            eventRepository.save(event);
        });

        // Create the ban record
        BannedBusiness ban = BannedBusiness.builder()
                .businessName(businessName)
                .reason(reason)
                .bannedBy(bannedBy)
                .isActive(true)
                .build();

        return bannedBusinessRepository.save(ban);
    }

    // Unban a business — restores their events and deactivates the ban
    public BannedBusiness unbanBusiness(String businessName) {
        BannedBusiness ban = bannedBusinessRepository
                .findByBusinessNameIgnoreCaseAndIsActiveTrue(businessName)
                .orElseThrow(() -> new IllegalArgumentException("No active ban found for: " + businessName));

        // Restore all events from this business back to pending for review
        List<Event> businessEvents = eventRepository.findByBusinessName(businessName);
        businessEvents.forEach(event -> {
            event.setStatus("pending");
            eventRepository.save(event);
        });

        // Deactivate the ban
        ban.setIsActive(false);
        return bannedBusinessRepository.save(ban);
    }
}