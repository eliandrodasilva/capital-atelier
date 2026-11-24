package com.capitalatelier.api.repository;

import com.capitalatelier.api.model.SeedExecution;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeedExecutionRepository extends JpaRepository<SeedExecution, Long> {
	boolean existsBySeedKey(String seedKey);
}
