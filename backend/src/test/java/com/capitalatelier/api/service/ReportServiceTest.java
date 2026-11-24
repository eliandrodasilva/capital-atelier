package com.capitalatelier.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.capitalatelier.api.dto.ReportStatementDTO;
import com.capitalatelier.api.enums.TransactionType;
import com.capitalatelier.api.model.Category;
import com.capitalatelier.api.model.Transaction;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.model.Wallet;
import com.capitalatelier.api.repository.TransactionRepository;
import com.capitalatelier.api.repository.WalletRepository;
import com.capitalatelier.api.util.SecurityUtils;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

	@Mock
	private TransactionRepository transactionRepository;

	@Mock
	private WalletRepository walletRepository;

	@Mock
	private WalletService walletService;

	@Mock
	private SecurityUtils securityUtils;

	private ReportService reportService;

	private User user;
	private Wallet wallet;

	@BeforeEach
	void setUp() {
		reportService = new ReportService(transactionRepository, walletRepository, walletService, securityUtils);

		user = new User();
		user.setId(1L);
		user.setUsername("carlos");

		wallet = new Wallet();
		wallet.setId(20L);
		wallet.setName("Carteira Casa");
		wallet.setOwner(user);
	}

	@Test
	void getStatement_shouldAggregateIncomeExpenseBalanceAndCategories() {
		Category food = new Category();
		food.setId(2L);
		food.setName("Alimentação");

		Transaction income = new Transaction();
		income.setId(1L);
		income.setWallet(wallet);
		income.setCreatedBy(user);
		income.setType(TransactionType.INCOME);
		income.setAmount(new BigDecimal("2000.00"));
		income.setDescription("Salário");
		income.setDate(LocalDate.of(2026, 11, 1));

		Transaction expense = new Transaction();
		expense.setId(2L);
		expense.setWallet(wallet);
		expense.setCreatedBy(user);
		expense.setCategory(food);
		expense.setType(TransactionType.EXPENSE);
		expense.setAmount(new BigDecimal("350.00"));
		expense.setDescription("Mercado");
		expense.setDate(LocalDate.of(2026, 11, 5));

		when(securityUtils.getAuthenticatedUser()).thenReturn(user);
		when(walletRepository.findById(20L)).thenReturn(Optional.of(wallet));
		when(transactionRepository.findFiltered(eq(20L), eq(null), eq(null), eq(null), eq(null), any(Pageable.class)))
				.thenReturn(new PageImpl<>(List.of(expense, income)));

		ReportStatementDTO statement = reportService.getStatement(20L, null, null, null, null);

		assertEquals("Carteira Casa", statement.walletName());
		assertEquals(new BigDecimal("2000.00"), statement.totalIncome());
		assertEquals(new BigDecimal("350.00"), statement.totalExpense());
		assertEquals(new BigDecimal("1650.00"), statement.balance());
		assertEquals(2L, statement.transactionCount());
		assertEquals(2, statement.byCategory().size());
	}

	@Test
	void exportCsv_shouldGenerateUtf8CsvAndPreventCsvInjection() {
		Transaction malicious = new Transaction();
		malicious.setId(3L);
		malicious.setWallet(wallet);
		malicious.setCreatedBy(user);
		malicious.setType(TransactionType.EXPENSE);
		malicious.setAmount(new BigDecimal("45.00"));
		malicious.setDescription("=SUM(A1:A2)");
		malicious.setDate(LocalDate.of(2026, 11, 10));

		when(securityUtils.getAuthenticatedUser()).thenReturn(user);
		when(walletRepository.findById(20L)).thenReturn(Optional.of(wallet));
		when(transactionRepository.findFiltered(eq(20L), eq(null), eq(null), eq(null), eq(null), any(Pageable.class)))
				.thenReturn(new PageImpl<>(List.of(malicious)));

		byte[] bytes = reportService.exportCsv(20L, null, null, null, null);
		String csv = new String(bytes, StandardCharsets.UTF_8);

		assertTrue(csv.contains("Data,Tipo,Categoria,Descricao,Responsavel,Valor"));
		assertTrue(csv.contains("\"'=SUM(A1:A2)\""));
		assertTrue(csv.contains("\"45.00\""));
	}
}
