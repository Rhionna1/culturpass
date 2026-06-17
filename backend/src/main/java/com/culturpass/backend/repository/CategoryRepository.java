package com.culturpass.backend.repository;

import com.culturpass.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

// Provides database operations for the categories table
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Get all active (non-deleted) categories ordered alphabetically by name
    List<Category> findByDeletedFalseOrderByNameAsc();

    // Get all deleted categories ordered alphabetically — for restore functionality
    List<Category> findByDeletedTrueOrderByNameAsc();

    // Find a category by name
    Optional<Category> findByName(String name);

    // Check if a category name already exists
    boolean existsByName(String name);
}