package com.culturpass.backend.controller;

import com.culturpass.backend.model.Category;
import com.culturpass.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

// Handles all HTTP requests for category management
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // GET /api/categories — get all active categories for the frontend
    @GetMapping
    public ResponseEntity<List<Category>> getActiveCategories() {
        return ResponseEntity.ok(categoryService.getActiveCategories());
    }

    // GET /api/categories/deleted — get all deleted categories for admin restore
    @GetMapping("/deleted")
    public ResponseEntity<List<Category>> getDeletedCategories() {
        return ResponseEntity.ok(categoryService.getDeletedCategories());
    }

    // POST /api/categories — add a new category (admin only)
    @PostMapping
    public ResponseEntity<Category> addCategory(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(categoryService.addCategory(body.get("name")));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // DELETE /api/categories/{id} — soft-delete a category (admin only)
    // Blocked with a clear message if events still reference this category
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(categoryService.deleteCategory(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/categories/{id}/restore — restore a deleted category (admin only)
    @PutMapping("/{id}/restore")
    public ResponseEntity<Category> restoreCategory(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(categoryService.restoreCategory(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}