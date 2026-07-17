package com.culturpass.backend.service;

import com.culturpass.backend.model.Category;
import com.culturpass.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

// Handles all business logic for category management
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final com.culturpass.backend.repository.EventRepository eventRepository;

    // Get all active categories — auto-expires temporary ones before returning
    // Temporary categories bypass the events-exist guard when they expire
    public List<Category> getActiveCategories() {
        // Auto soft-delete any expired temporary categories
        autoExpireCategories();
        return categoryRepository.findByDeletedFalseOrderByNameAsc();
    }

    // Checks all temporary categories and soft-deletes any that have passed their expiration date
    private void autoExpireCategories() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        categoryRepository.findByDeletedFalseOrderByNameAsc().stream()
                .filter(cat -> Boolean.TRUE.equals(cat.getIsTemporary())
                        && cat.getExpiresAt() != null
                        && cat.getExpiresAt().isBefore(now))
                .forEach(cat -> {
                    // Bypass the events-exist guard — temporary categories are expected to have events
                    cat.setDeleted(true);
                    categoryRepository.save(cat);
                });
    }

    // Get all soft-deleted categories — for admin restore functionality — always alphabetical
    public List<Category> getDeletedCategories() {
        return categoryRepository.findByDeletedTrueOrderByNameAsc();
    }

    // Add a new category — admin only
    // If a deleted category with the same name exists, restore it instead of creating a duplicate
    public Category addCategory(String name, Boolean isTemporary, java.time.LocalDateTime expiresAt) {
        // Check if a deleted category with this name already exists
        java.util.Optional<Category> existing = categoryRepository.findByName(name);
        if (existing.isPresent()) {
            Category cat = existing.get();
            if (cat.getDeleted()) {
                // Restore it with the new settings instead of throwing an error
                cat.setDeleted(false);
                cat.setIsTemporary(isTemporary != null && isTemporary);
                cat.setExpiresAt(expiresAt);
                return categoryRepository.save(cat);
            } else {
                throw new IllegalStateException("Category already exists and is active: " + name);
            }
        }
        // Create a brand new category
        Category category = Category.builder()
                .name(name)
                .deleted(false)
                .isTemporary(isTemporary != null && isTemporary)
                .expiresAt(expiresAt)
                .displayOrder(0)
                .build();
        return categoryRepository.save(category);
    }

    // Soft-delete a category — admin only
    // Blocked if any events still reference this category — must reassign or delete those events first
    public Category deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // Check if any events still use this category
        List<com.culturpass.backend.model.Event> eventsInCategory =
                eventRepository.findByCategory(category.getName());

        if (!eventsInCategory.isEmpty()) {
            throw new IllegalStateException(
                    "Cannot delete category '" + category.getName() + "' — " +
                            eventsInCategory.size() + " event(s) still use this category. " +
                            "Reassign or delete those events first."
            );
        }

        category.setDeleted(true);
        return categoryRepository.save(category);
    }

    // Restore a soft-deleted category as permanent — admin only
    public Category restoreCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        category.setDeleted(false);
        category.setIsTemporary(false);
        category.setExpiresAt(null);
        return categoryRepository.save(category);
    }

    // Restore a soft-deleted category as temporary with a new expiration date — admin only
    public Category restoreAsTemporary(Long id, java.time.LocalDateTime expiresAt) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        category.setDeleted(false);
        category.setIsTemporary(true);
        category.setExpiresAt(expiresAt);
        return categoryRepository.save(category);
    }
}