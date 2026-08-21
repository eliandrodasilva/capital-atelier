package com.capitalatelier.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.capitalatelier.api.model.WalletMember;

@Repository
public interface WalletMemberRepository extends JpaRepository<WalletMember, Long> {
    List<WalletMember> findByWalletId(Long walletId);
    Optional<WalletMember> findByWalletIdAndUserId(Long walletId, Long userId);
    boolean existsByWalletIdAndUserId(Long walletId, Long userId);
    void deleteByWalletIdAndUserId(Long walletId, Long userId);
}
