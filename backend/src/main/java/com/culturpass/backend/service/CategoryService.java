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

    // Get all active categories for the frontend dropdown and filter pills — always alphabetical
    public List<Category> getActiveCategories() {
        return categoryRepository.findByDeletedFalseOrderByNameAsc();
    }

    // Get all soft-deleted categories — for admin restore functionality — always alphabetical
    public List<Category> getDeletedCategories() {
        return categoryRepository.findByDeletedTrueOrderByNameAsc();
    }

    // Add a new category — admin only
    public Category addCategory(String name) {
        if (categoryRepository.existsByName(name)) {
            throw new IllegalStateException("Category already exists: " + name);
        }
        Category category = Category.builder()
                .name(name)
                .deleted(false)
                .displayOrder(0)
                .build();
        return categoryRepository.save(category);
    }

    // Soft-delete a category — admin only
    // The category is hidden but not permanently removed
    public Category deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        category.setDeleted(true);
        return categoryRepository.save(category);
    }

    // Restore a soft-deleted category — admin only
    public Category restoreCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        category.setDeleted(false);
        return categoryRepository.save(category);
    }
}