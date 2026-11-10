package com.capitalatelier.api.repository;

import com.capitalatelier.api.enums.TransactionType;
import com.capitalatelier.api.model.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
	List<Category> findByUserId(Long userId);
	List<Category> findByUserIdAndType(Long userId, TransactionType type);
	Optional<Category> findByIdAndUserId(Long id, Long userId);
	boolean existsByUserIdAndName(Long userId, String name);
}
