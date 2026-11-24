package com.capitalatelier.api.config;

import com.capitalatelier.api.enums.TransactionType;
import com.capitalatelier.api.enums.WalletRole;
import com.capitalatelier.api.model.Category;
import com.capitalatelier.api.model.SeedExecution;
import com.capitalatelier.api.model.Transaction;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.model.Wallet;
import com.capitalatelier.api.model.WalletMember;
import com.capitalatelier.api.repository.CategoryRepository;
import com.capitalatelier.api.repository.SeedExecutionRepository;
import com.capitalatelier.api.repository.TransactionRepository;
import com.capitalatelier.api.repository.UserRepository;
import com.capitalatelier.api.repository.WalletMemberRepository;
import com.capitalatelier.api.repository.WalletRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class SuitsDataSeeder implements ApplicationRunner {

	private static final String SEED_KEY = "suits-demo-v1";
	private static final String DEFAULT_PASSWORD = "Suits@2026";

	private final SeedExecutionRepository seedExecutionRepository;
	private final UserRepository userRepository;
	private final WalletRepository walletRepository;
	private final WalletMemberRepository walletMemberRepository;
	private final CategoryRepository categoryRepository;
	private final TransactionRepository transactionRepository;
	private final PasswordEncoder passwordEncoder;

	public SuitsDataSeeder(SeedExecutionRepository seedExecutionRepository, UserRepository userRepository,
			WalletRepository walletRepository, WalletMemberRepository walletMemberRepository,
			CategoryRepository categoryRepository, TransactionRepository transactionRepository,
			PasswordEncoder passwordEncoder) {
		this.seedExecutionRepository = seedExecutionRepository;
		this.userRepository = userRepository;
		this.walletRepository = walletRepository;
		this.walletMemberRepository = walletMemberRepository;
		this.categoryRepository = categoryRepository;
		this.transactionRepository = transactionRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (seedExecutionRepository.existsBySeedKey(SEED_KEY)) {
			return;
		}

		User harvey = findOrCreateUser("Harvey Specter", "harvey@pearsonspecter.com");
		User mike = findOrCreateUser("Mike Ross", "mike@pearsonspecter.com");
		User louis = findOrCreateUser("Louis Litt", "louis@pearsonspecter.com");

		Wallet firmWallet = createWallet(harvey, "Pearson Specter — Operacional",
				"Fundo operacional e despesas corporativas do escritório");
		Wallet personalWallet = createWallet(harvey, "Harvey Specter — Pessoal",
				"Patrimônio e despesas pessoais");

		addMember(firmWallet, mike, WalletRole.EDITOR);
		addMember(firmWallet, louis, WalletRole.VIEWER);

		Category honorarios = createCategory(harvey, "Honorários Advocatícios", TransactionType.INCOME, "#171717");
		Category retainers = createCategory(harvey, "Retainers Corporativos", TransactionType.INCOME, "#404040");
		Category bonus = createCategory(harvey, "Bônus de Sócios", TransactionType.INCOME, "#737373");

		Category operacoes = createCategory(harvey, "Operações do Escritório", TransactionType.EXPENSE, "#171717");
		Category pesquisa = createCategory(harvey, "Pesquisa Jurídica", TransactionType.EXPENSE, "#404040");
		Category viagens = createCategory(harvey, "Viagens e Reuniões", TransactionType.EXPENSE, "#737373");
		Category alfaiataria = createCategory(harvey, "Alfaiataria e Estilo", TransactionType.EXPENSE, "#A3A3A3");

		List<Transaction> transactions = List.of(
				buildTx(firmWallet, retainers, harvey, TransactionType.INCOME, "45000.00",
						"Retainer mensal — Gillis Industries", LocalDate.of(2026, 9, 5)),
				buildTx(firmWallet, honorarios, harvey, TransactionType.INCOME, "28500.00",
						"Acordo extrajudicial — Caso McKernon Motors", LocalDate.of(2026, 9, 18)),
				buildTx(firmWallet, operacoes, harvey, TransactionType.EXPENSE, "18200.00",
						"Aluguel do 50º andar — Midtown Manhattan", LocalDate.of(2026, 9, 10)),
				buildTx(firmWallet, pesquisa, mike, TransactionType.EXPENSE, "4300.00",
						"Base de jurisprudência e arquivos do caso", LocalDate.of(2026, 9, 22)),

				buildTx(firmWallet, retainers, harvey, TransactionType.INCOME, "45000.00",
						"Retainer mensal — Hessington Oil", LocalDate.of(2026, 10, 5)),
				buildTx(firmWallet, honorarios, mike, TransactionType.INCOME, "34000.00",
						"Fusão corporativa — Sutter Capital", LocalDate.of(2026, 10, 19)),
				buildTx(firmWallet, operacoes, harvey, TransactionType.EXPENSE, "18200.00",
						"Aluguel do 50º andar — Midtown Manhattan", LocalDate.of(2026, 10, 10)),
				buildTx(firmWallet, viagens, harvey, TransactionType.EXPENSE, "6850.00",
						"Jantar estratégico com conselho de sócios", LocalDate.of(2026, 10, 25)),

				buildTx(firmWallet, retainers, harvey, TransactionType.INCOME, "48000.00",
						"Retainer mensal — Folsom Foods", LocalDate.of(2026, 11, 5)),
				buildTx(firmWallet, honorarios, mike, TransactionType.INCOME, "22000.00",
						"Consultoria societária — Ava Hessington", LocalDate.of(2026, 11, 14)),
				buildTx(firmWallet, operacoes, harvey, TransactionType.EXPENSE, "18200.00",
						"Aluguel do 50º andar — Midtown Manhattan", LocalDate.of(2026, 11, 10)),
				buildTx(firmWallet, pesquisa, mike, TransactionType.EXPENSE, "5100.00",
						"Diligências e auditoria de contratos", LocalDate.of(2026, 11, 16)),
				buildTx(firmWallet, viagens, harvey, TransactionType.EXPENSE, "3900.00",
						"Motorista executivo (Ray) — deslocamentos semanais", LocalDate.of(2026, 11, 19)),

				buildTx(personalWallet, bonus, harvey, TransactionType.INCOME, "35000.00",
						"Distribuição de lucros — Sócio Sênior", LocalDate.of(2026, 11, 6)),
				buildTx(personalWallet, alfaiataria, harvey, TransactionType.EXPENSE, "8400.00",
						"Ternos sob medida — Tom Ford", LocalDate.of(2026, 11, 11)),
				buildTx(personalWallet, alfaiataria, harvey, TransactionType.EXPENSE, "2950.00",
						"Coleção de vinis raros — Edição limitada", LocalDate.of(2026, 11, 15)),
				buildTx(personalWallet, viagens, harvey, TransactionType.EXPENSE, "4200.00",
						"Jantar privado com clientes VIP", LocalDate.of(2026, 11, 20)));

		transactionRepository.saveAll(transactions);

		SeedExecution execution = new SeedExecution();
		execution.setSeedKey(SEED_KEY);
		seedExecutionRepository.save(execution);
	}

	private User findOrCreateUser(String username, String email) {
		return userRepository.findByEmail(email).orElseGet(() -> {
			User user = new User();
			user.setUsername(username);
			user.setEmail(email);
			user.setEncryptedPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
			return userRepository.save(user);
		});
	}

	private Wallet createWallet(User owner, String name, String description) {
		Wallet wallet = new Wallet();
		wallet.setOwner(owner);
		wallet.setName(name);
		wallet.setDescription(description);
		Wallet saved = walletRepository.save(wallet);

		WalletMember ownerMember = new WalletMember();
		ownerMember.setWallet(saved);
		ownerMember.setUser(owner);
		ownerMember.setRole(WalletRole.OWNER);
		walletMemberRepository.save(ownerMember);

		return saved;
	}

	private void addMember(Wallet wallet, User user, WalletRole role) {
		WalletMember member = new WalletMember();
		member.setWallet(wallet);
		member.setUser(user);
		member.setRole(role);
		walletMemberRepository.save(member);
	}

	private Category createCategory(User user, String name, TransactionType type, String color) {
		Category category = new Category();
		category.setUser(user);
		category.setName(name);
		category.setType(type);
		category.setColor(color);
		return categoryRepository.save(category);
	}

	private Transaction buildTx(Wallet wallet, Category category, User createdBy, TransactionType type, String amount,
			String description, LocalDate date) {
		Transaction tx = new Transaction();
		tx.setWallet(wallet);
		tx.setCategory(category);
		tx.setCreatedBy(createdBy);
		tx.setType(type);
		tx.setAmount(new BigDecimal(amount));
		tx.setDescription(description);
		tx.setDate(date);
		return tx;
	}
}
