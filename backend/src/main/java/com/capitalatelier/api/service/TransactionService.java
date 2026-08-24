package com.capitalatelier.api.service;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.capitalatelier.api.dto.TransactionRequestDTO;
import com.capitalatelier.api.dto.TransactionResponseDTO;
import com.capitalatelier.api.enums.TransactionType;
import com.capitalatelier.api.model.Category;
import com.capitalatelier.api.model.Transaction;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.model.Wallet;
import com.capitalatelier.api.repository.CategoryRepository;
import com.capitalatelier.api.repository.TransactionRepository;
import com.capitalatelier.api.repository.WalletRepository;
import com.capitalatelier.api.util.SecurityUtils;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final WalletService walletService;
    private final SecurityUtils securityUtils;

    public TransactionService(
            TransactionRepository transactionRepository,
            WalletRepository walletRepository,
            CategoryRepository categoryRepository,
            WalletService walletService,
            SecurityUtils securityUtils) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
        this.categoryRepository = categoryRepository;
        this.walletService = walletService;
        this.securityUtils = securityUtils;
    }

    public Page<TransactionResponseDTO> getTransactions(
            Long walletId,
            TransactionType type,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable) {

        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        walletService.checkMemberAccess(wallet, user.getId());

        Page<Transaction> page = transactionRepository.findFiltered(
                walletId, type, categoryId, startDate, endDate, pageable
        );

        return page.map(this::toDTO);
    }

    @Transactional
    public TransactionResponseDTO createTransaction(Long walletId, TransactionRequestDTO dto) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        walletService.checkCanWriteTransaction(wallet, user.getId());

        Category category = null;
        if (dto.categoryId() != null) {
            category = categoryRepository.findById(dto.categoryId())
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        }

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setCategory(category);
        transaction.setCreatedBy(user);
        transaction.setType(dto.type());
        transaction.setAmount(dto.amount());
        transaction.setDescription(dto.description());
        transaction.setDate(dto.date());

        return toDTO(transactionRepository.save(transaction));
    }

    public TransactionResponseDTO getTransaction(Long walletId, Long id) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        walletService.checkMemberAccess(wallet, user.getId());

        Transaction transaction = transactionRepository.findByIdAndWalletId(id, walletId)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));

        return toDTO(transaction);
    }

    @Transactional
    public TransactionResponseDTO updateTransaction(Long walletId, Long id, TransactionRequestDTO dto) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        walletService.checkCanWriteTransaction(wallet, user.getId());

        Transaction transaction = transactionRepository.findByIdAndWalletId(id, walletId)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));

        Category category = null;
        if (dto.categoryId() != null) {
            category = categoryRepository.findById(dto.categoryId())
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        }

        transaction.setType(dto.type());
        transaction.setAmount(dto.amount());
        transaction.setDescription(dto.description());
        transaction.setDate(dto.date());
        transaction.setCategory(category);

        return toDTO(transactionRepository.save(transaction));
    }

    @Transactional
    public void deleteTransaction(Long walletId, Long id) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        walletService.checkCanWriteTransaction(wallet, user.getId());

        Transaction transaction = transactionRepository.findByIdAndWalletId(id, walletId)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));

        transactionRepository.delete(transaction);
    }

    private TransactionResponseDTO toDTO(Transaction t) {
        return new TransactionResponseDTO(
                t.getId(),
                t.getWallet().getId(),
                t.getCategory() != null ? t.getCategory().getId() : null,
                t.getCategory() != null ? t.getCategory().getName() : null,
                t.getCreatedBy().getId(),
                t.getCreatedBy().getUsername(),
                t.getType(),
                t.getAmount(),
                t.getDescription(),
                t.getDate(),
                t.getCreatedAt()
        );
    }
}
