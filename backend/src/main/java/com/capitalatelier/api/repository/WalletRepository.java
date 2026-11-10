package com.capitalatelier.api.repository;

import com.capitalatelier.api.model.Wallet;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
	List<Wallet> findByOwnerId(Long ownerId);

	@Query("SELECT DISTINCT w FROM Wallet w LEFT JOIN w.members m WHERE w.owner.id = :userId OR m.user.id = :userId")
	List<Wallet> findAllAccessibleByUser(@Param("userId") Long userId);
}
