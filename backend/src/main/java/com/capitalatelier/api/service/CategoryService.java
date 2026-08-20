package com.capitalatelier.api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.capitalatelier.api.dto.CategoryRequestDTO;
import com.capitalatelier.api.dto.CategoryResponseDTO;
import com.capitalatelier.api.enums.TransactionType;
import com.capitalatelier.api.model.Category;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.repository.CategoryRepository;
import com.capitalatelier.api.repository.TransactionRepository;
import com.capitalatelier.api.util.SecurityUtils;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    private TransactionRepository transactionRepository;

    public List<CategoryResponseDTO> getCategories(TransactionType type) {
        User user = securityUtils.getAuthenticatedUser();
        List<Category> list = (type != null) ? 
            categoryRepository.findByUserIdAndType(user.getId(), type) : categoryRepository.findByUserId(user.getId());

        return list.stream().map(this::toDTO).toList();
    }

    public CategoryResponseDTO createCategory(CategoryRequestDTO dto) {
        User user = securityUtils.getAuthenticatedUser();

        if (categoryRepository.existsByUserIdAndName(user.getId(), dto.name())) {
            throw new RuntimeException("Você já possui uma categoria cadastrada com este nome");
        }

        Category category = new Category();
        category.setUser(user);
        category.setName(dto.name());
        category.setType(dto.type());
        category.setColor(dto.color());

        return toDTO(categoryRepository.save(category));
    }

    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO dto) {
        User user = securityUtils.getAuthenticatedUser();

        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new RuntimeException("Categoria não encontrada ou você não tem permissão para acessá-la"));

        category.setName(dto.name());
        category.setType(dto.type());
        category.setColor(dto.color());

        return toDTO(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        User user = securityUtils.getAuthenticatedUser();
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new RuntimeException("Categoria não encontrada ou você não tem permissão para acessá-la"));

        if (transactionRepository.existsByCategoryId(id)) {
            throw new RuntimeException("Não é possível excluir uma categoria que possui transações vinculadas.");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponseDTO toDTO(Category category) {
        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getColor()
        );
    }
}
