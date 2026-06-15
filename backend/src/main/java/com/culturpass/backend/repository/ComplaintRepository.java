package com.culturpass.backend.repository;

import com.culturpass.backend.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

// Provides database operations for the complaints table
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    // Get all complaints newest first
    List<Complaint> findAllByOrderByCreatedAtDesc();

    // Get all unreviewed complaints
    List<Complaint> findByReviewedFalseOrderByCreatedAtDesc();

    // Get all racism complaints — highest priority
    List<Complaint> findByIsRacismComplaintTrueOrderByCreatedAtDesc();

    // Get complaints by who submitted them
    List<Complaint> findBySubmittedByOrderByCreatedAtDesc(String submittedBy);
}