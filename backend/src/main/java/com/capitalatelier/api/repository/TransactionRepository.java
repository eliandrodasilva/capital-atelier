package com.capitalatelier.api.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.capitalatelier.api.enums.TransactionType;
import com.capitalatelier.api.model.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWalletId(Long walletId);
    Optional<Transaction> findByIdAndWalletId(Long id, Long walletId);
    boolean existsByCategoryId(Long categoryId);

    @Query("SELECT t FROM Transaction t WHERE t.wallet.id = :walletId " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
           "AND (:startDate IS NULL OR t.date >= :startDate) " +
           "AND (:endDate IS NULL OR t.date <= :endDate)")
    Page<Transaction> findFiltered(
            @Param("walletId") Long walletId,
            @Param("type") TransactionType type,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    @Query("SELECT t FROM Transaction t WHERE t.wallet.id = :walletId " +
           "AND (:startDate IS NULL OR t.date >= :startDate) " +
           "AND (:endDate IS NULL OR t.date <= :endDate)")
    List<Transaction> findForSummary(
            @Param("walletId") Long walletId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
