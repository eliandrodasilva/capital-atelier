package com.capitalatelier.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.capitalatelier.api.dto.RealtimeEventDTO;
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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

	@Mock
	private TransactionRepository transactionRepository;

	@Mock
	private WalletRepository walletRepository;

	@Mock
	private CategoryRepository categoryRepository;

	@Mock
	private WalletService walletService;

	@Mock
	private SecurityUtils securityUtils;

	@Mock
	private RealtimeService realtimeService;

	private TransactionService transactionService;

	private User user;
	private Wallet wallet;
	private Category category;

	@BeforeEach
	void setUp() {
		transactionService = new TransactionService(transactionRepository, walletRepository, categoryRepository,
				walletService, securityUtils, realtimeService);

		user = new User();
		user.setId(1L);
		user.setUsername("ana");
		user.setEmail("ana@email.com");

		wallet = new Wallet();
		wallet.setId(10L);
		wallet.setName("Carteira Principal");
		wallet.setOwner(user);

		category = new Category();
		category.setId(5L);
		category.setName("Alimentação");
		category.setType(TransactionType.EXPENSE);
	}

	@Test
	void createTransaction_shouldSaveAndPublishRealtimeEvent() {
		TransactionRequestDTO dto = new TransactionRequestDTO(TransactionType.EXPENSE, new BigDecimal("120.50"),
				"Mercado", LocalDate.of(2026, 11, 20), 5L);

		when(securityUtils.getAuthenticatedUser()).thenReturn(user);
		when(walletRepository.findById(10L)).thenReturn(Optional.of(wallet));
		when(categoryRepository.findById(5L)).thenReturn(Optional.of(category));
		when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
			Transaction t = inv.getArgument(0);
			t.setId(99L);
			return t;
		});

		TransactionResponseDTO result = transactionService.createTransaction(10L, dto);

		assertEquals(99L, result.id());
		assertEquals(new BigDecimal("120.50"), result.amount());
		assertEquals("Alimentação", result.categoryName());

		ArgumentCaptor<RealtimeEventDTO> eventCaptor = ArgumentCaptor.forClass(RealtimeEventDTO.class);
		verify(realtimeService).publish(eq(10L), eventCaptor.capture());
		assertEquals("TRANSACTION_CREATED", eventCaptor.getValue().type());
		assertEquals("ana", eventCaptor.getValue().actorName());
	}

	@Test
	void createTransaction_shouldThrowWhenViewerTriesToWrite() {
		TransactionRequestDTO dto = new TransactionRequestDTO(TransactionType.INCOME, new BigDecimal("500.00"),
				"Salário", LocalDate.of(2026, 11, 20), null);

		when(securityUtils.getAuthenticatedUser()).thenReturn(user);
		when(walletRepository.findById(10L)).thenReturn(Optional.of(wallet));
		doThrow(new RuntimeException("Acesso negado")).when(walletService).checkCanWriteTransaction(wallet, 1L);

		assertThrows(RuntimeException.class, () -> transactionService.createTransaction(10L, dto));
		verify(transactionRepository, never()).save(any());
		verify(realtimeService, never()).publish(any(), any());
	}

	@Test
	void deleteTransaction_shouldDeleteAndPublishRealtimeEvent() {
		Transaction tx = new Transaction();
		tx.setId(55L);
		tx.setWallet(wallet);
		tx.setCreatedBy(user);

		when(securityUtils.getAuthenticatedUser()).thenReturn(user);
		when(walletRepository.findById(10L)).thenReturn(Optional.of(wallet));
		when(transactionRepository.findByIdAndWalletId(55L, 10L)).thenReturn(Optional.of(tx));

		transactionService.deleteTransaction(10L, 55L);

		verify(transactionRepository).delete(tx);
		ArgumentCaptor<RealtimeEventDTO> eventCaptor = ArgumentCaptor.forClass(RealtimeEventDTO.class);
		verify(realtimeService).publish(eq(10L), eventCaptor.capture());
		assertEquals("TRANSACTION_DELETED", eventCaptor.getValue().type());
	}
}
