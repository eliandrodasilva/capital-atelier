package com.capitalatelier.api.service;

import com.capitalatelier.api.dto.CategorySummaryDTO;
import com.capitalatelier.api.dto.ReportStatementDTO;
import com.capitalatelier.api.dto.TransactionResponseDTO;
import com.capitalatelier.api.enums.TransactionType;
import com.capitalatelier.api.model.Transaction;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.model.Wallet;
import com.capitalatelier.api.repository.TransactionRepository;
import com.capitalatelier.api.repository.WalletRepository;
import com.capitalatelier.api.util.SecurityUtils;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

	private final TransactionRepository transactionRepository;
	private final WalletRepository walletRepository;
	private final WalletService walletService;
	private final SecurityUtils securityUtils;

	public ReportService(TransactionRepository transactionRepository, WalletRepository walletRepository,
			WalletService walletService, SecurityUtils securityUtils) {
		this.transactionRepository = transactionRepository;
		this.walletRepository = walletRepository;
		this.walletService = walletService;
		this.securityUtils = securityUtils;
	}

	public ReportStatementDTO getStatement(Long walletId, TransactionType type, Long categoryId, LocalDate startDate,
			LocalDate endDate) {
		User user = securityUtils.getAuthenticatedUser();
		Wallet wallet = walletRepository.findById(walletId)
				.orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

		walletService.checkMemberAccess(wallet, user.getId());

		List<Transaction> transactions = transactionRepository.findFiltered(walletId, type, categoryId, startDate,
				endDate, Pageable.unpaged(Sort.by(Sort.Direction.DESC, "date"))).getContent();

		BigDecimal totalIncome = BigDecimal.ZERO;
		BigDecimal totalExpense = BigDecimal.ZERO;
		Map<String, CategoryAccumulator> categoryMap = new LinkedHashMap<>();

		for (Transaction t : transactions) {
			BigDecimal amount = t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO;
			if (t.getType() == TransactionType.INCOME) {
				totalIncome = totalIncome.add(amount);
			} else {
				totalExpense = totalExpense.add(amount);
			}

			Long catId = t.getCategory() != null ? t.getCategory().getId() : null;
			String catName = t.getCategory() != null ? t.getCategory().getName() : "Sem categoria";
			String key = (catId != null ? catId.toString() : "none") + ":" + catName;

			CategoryAccumulator acc = categoryMap.computeIfAbsent(key, k -> new CategoryAccumulator(catId, catName));
			acc.total = acc.total.add(amount);
		}

		List<CategorySummaryDTO> byCategory = categoryMap.values().stream()
				.map(a -> new CategorySummaryDTO(a.categoryId, a.categoryName, a.total))
				.sorted(Comparator.comparing(CategorySummaryDTO::total).reversed()).toList();

		List<TransactionResponseDTO> txDTOs = transactions.stream().map(this::toDTO).toList();

		return new ReportStatementDTO(wallet.getName(), startDate, endDate, totalIncome, totalExpense,
				totalIncome.subtract(totalExpense), txDTOs.size(), byCategory, txDTOs);
	}

	public byte[] exportCsv(Long walletId, TransactionType type, Long categoryId, LocalDate startDate,
			LocalDate endDate) {
		ReportStatementDTO statement = getStatement(walletId, type, categoryId, startDate, endDate);
		StringBuilder sb = new StringBuilder();
		sb.append('\uFEFF');
		sb.append("Data,Tipo,Categoria,Descricao,Responsavel,Valor\n");

		for (TransactionResponseDTO t : statement.transactions()) {
			String dateStr = t.date() != null ? t.date().toString() : "";
			String typeStr = t.type() == TransactionType.INCOME ? "Receita" : "Despesa";
			String catStr = t.categoryName() != null ? t.categoryName() : "Sem categoria";
			String descStr = t.description() != null ? t.description() : "";
			String actorStr = t.createdByName() != null ? t.createdByName() : "";
			String amountStr = t.amount() != null ? t.amount().toPlainString() : "0.00";

			sb.append(escapeCsv(dateStr)).append(',').append(escapeCsv(typeStr)).append(',').append(escapeCsv(catStr))
					.append(',').append(escapeCsv(descStr)).append(',').append(escapeCsv(actorStr)).append(',')
					.append(escapeCsv(amountStr)).append('\n');
		}

		return sb.toString().getBytes(StandardCharsets.UTF_8);
	}

	public String escapeCsv(String value) {
		if (value == null) {
			return "\"\"";
		}
		String sanitized = value;
		if (!sanitized.isEmpty()) {
			char first = sanitized.charAt(0);
			if (first == '=' || first == '+' || first == '-' || first == '@' || first == '\t' || first == '\r') {
				sanitized = "'" + sanitized;
			}
		}
		return "\"" + sanitized.replace("\"", "\"\"") + "\"";
	}

	private TransactionResponseDTO toDTO(Transaction t) {
		return new TransactionResponseDTO(t.getId(), t.getWallet().getId(),
				t.getCategory() != null ? t.getCategory().getId() : null,
				t.getCategory() != null ? t.getCategory().getName() : null, t.getCreatedBy().getId(),
				t.getCreatedBy().getUsername(), t.getType(), t.getAmount(), t.getDescription(), t.getDate(),
				t.getCreatedAt());
	}

	private static class CategoryAccumulator {
		final Long categoryId;
		final String categoryName;
		BigDecimal total = BigDecimal.ZERO;

		CategoryAccumulator(Long categoryId, String categoryName) {
			this.categoryId = categoryId;
			this.categoryName = categoryName;
		}
	}
}
