package com.capitalatelier.api.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.stereotype.Service;

import com.capitalatelier.api.dto.CategorySummaryDTO;
import com.capitalatelier.api.dto.MonthlySummaryDTO;
import com.capitalatelier.api.dto.SummaryResponseDTO;
import com.capitalatelier.api.enums.TransactionType;
import com.capitalatelier.api.model.Transaction;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.model.Wallet;
import com.capitalatelier.api.repository.TransactionRepository;
import com.capitalatelier.api.repository.WalletRepository;
import com.capitalatelier.api.util.SecurityUtils;

@Service
public class SummaryService {

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final WalletService walletService;
    private final SecurityUtils securityUtils;

    public SummaryService(
            TransactionRepository transactionRepository,
            WalletRepository walletRepository,
            WalletService walletService,
            SecurityUtils securityUtils) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
        this.walletService = walletService;
        this.securityUtils = securityUtils;
    }

    public SummaryResponseDTO getSummary(Long walletId, LocalDate startDate, LocalDate endDate) {
        User user = securityUtils.getAuthenticatedUser();
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

        walletService.checkMemberAccess(wallet, user.getId());

        List<Transaction> transactions = transactionRepository.findForSummary(walletId, startDate, endDate);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        Map<Long, CategoryAccumulator> categoryMap = new LinkedHashMap<>();
        Map<String, MonthAccumulator> monthMap = new TreeMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (Transaction t : transactions) {
            BigDecimal amount = t.getAmount();

            if (t.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(amount);
            } else {
                totalExpense = totalExpense.add(amount);
            }

            if (t.getCategory() != null) {
                Long catId = t.getCategory().getId();
                String catName = t.getCategory().getName();
                categoryMap.computeIfAbsent(catId, k -> new CategoryAccumulator(catId, catName))
                        .add(amount);
            }

            if (t.getDate() != null) {
                String monthKey = t.getDate().format(monthFormatter);
                MonthAccumulator monthAcc = monthMap.computeIfAbsent(monthKey, MonthAccumulator::new);
                if (t.getType() == TransactionType.INCOME) {
                    monthAcc.addIncome(amount);
                } else {
                    monthAcc.addExpense(amount);
                }
            }
        }

        BigDecimal balance = totalIncome.subtract(totalExpense);

        List<CategorySummaryDTO> byCategory = categoryMap.values().stream()
                .map(acc -> new CategorySummaryDTO(acc.id, acc.name, acc.total))
                .toList();

        List<MonthlySummaryDTO> byMonth = monthMap.values().stream()
                .map(acc -> new MonthlySummaryDTO(acc.month, acc.income, acc.expense))
                .toList();

        return new SummaryResponseDTO(
                totalIncome,
                totalExpense,
                balance,
                transactions.size(),
                byCategory,
                byMonth
        );
    }

    private static class CategoryAccumulator {
        Long id;
        String name;
        BigDecimal total = BigDecimal.ZERO;

        CategoryAccumulator(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        void add(BigDecimal val) {
            this.total = this.total.add(val);
        }
    }

    private static class MonthAccumulator {
        String month;
        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;

        MonthAccumulator(String month) {
            this.month = month;
        }

        void addIncome(BigDecimal val) {
            this.income = this.income.add(val);
        }

        void addExpense(BigDecimal val) {
            this.expense = this.expense.add(val);
        }
    }
}
