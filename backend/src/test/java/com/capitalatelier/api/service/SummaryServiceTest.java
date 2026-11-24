package com.capitalatelier.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.capitalatelier.api.dto.SummaryResponseDTO;
import com.capitalatelier.api.enums.TransactionType;
import com.capitalatelier.api.model.Category;
import com.capitalatelier.api.model.Transaction;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.model.Wallet;
import com.capitalatelier.api.repository.TransactionRepository;
import com.capitalatelier.api.repository.WalletRepository;
import com.capitalatelier.api.util.SecurityUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SummaryServiceTest {

	@Mock
	private TransactionRepository transactionRepository;

	@Mock
	private WalletRepository walletRepository;

	@Mock
	private WalletService walletService;

	@Mock
	private SecurityUtils securityUtils;

	private SummaryService summaryService;

	@BeforeEach
	void setUp() {
		summaryService = new SummaryService(transactionRepository, walletRepository, walletService, securityUtils);
	}

	@Test
	void getSummary_shouldComputeTotalsBalanceAndGroupings() {
		User user = new User();
		user.setId(1L);

		Wallet wallet = new Wallet();
		wallet.setId(30L);
		wallet.setOwner(user);

		Category rent = new Category();
		rent.setId(4L);
		rent.setName("Moradia");

		Transaction t1 = new Transaction();
		t1.setType(TransactionType.INCOME);
		t1.setAmount(new BigDecimal("3000.00"));
		t1.setDate(LocalDate.of(2026, 11, 2));

		Transaction t2 = new Transaction();
		t2.setType(TransactionType.EXPENSE);
		t2.setAmount(new BigDecimal("1200.00"));
		t2.setCategory(rent);
		t2.setDate(LocalDate.of(2026, 11, 5));

		when(securityUtils.getAuthenticatedUser()).thenReturn(user);
		when(walletRepository.findById(30L)).thenReturn(Optional.of(wallet));
		when(transactionRepository.findForSummary(30L, null, null)).thenReturn(List.of(t1, t2));

		SummaryResponseDTO summary = summaryService.getSummary(30L, null, null);

		assertEquals(new BigDecimal("3000.00"), summary.totalIncome());
		assertEquals(new BigDecimal("1200.00"), summary.totalExpense());
		assertEquals(new BigDecimal("1800.00"), summary.balance());
		assertEquals(2L, summary.transactionCount());
		assertEquals(1, summary.byMonth().size());
	}
}
