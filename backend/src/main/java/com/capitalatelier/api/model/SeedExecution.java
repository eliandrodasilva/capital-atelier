package com.capitalatelier.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "seed_executions")
@Data
public class SeedExecution {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "seed_key", nullable = false, unique = true, length = 80)
	private String seedKey;

	@CreationTimestamp
	@Column(name = "executed_at", updatable = false)
	private LocalDateTime executedAt;
}
