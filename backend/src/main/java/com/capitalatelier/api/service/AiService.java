package com.capitalatelier.api.service;

import com.capitalatelier.api.dto.AiCategorizeRequestDTO;
import com.capitalatelier.api.dto.AiCategorizeResponseDTO;
import com.capitalatelier.api.dto.AiInsightResponseDTO;
import com.capitalatelier.api.dto.CategorySummaryDTO;
import com.capitalatelier.api.dto.ReportStatementDTO;
import com.capitalatelier.api.dto.TransactionResponseDTO;
import com.capitalatelier.api.model.Category;
import com.capitalatelier.api.model.User;
import com.capitalatelier.api.model.Wallet;
import com.capitalatelier.api.repository.CategoryRepository;
import com.capitalatelier.api.repository.WalletRepository;
import com.capitalatelier.api.util.SecurityUtils;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class AiService {

	private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

	private final ReportService reportService;
	private final CategoryRepository categoryRepository;
	private final WalletRepository walletRepository;
	private final WalletService walletService;
	private final SecurityUtils securityUtils;
	private final ObjectMapper objectMapper;
	private final RestClient restClient;
	private final String apiKey;
	private final String model;

	public AiService(ReportService reportService, CategoryRepository categoryRepository,
			WalletRepository walletRepository, WalletService walletService, SecurityUtils securityUtils,
			ObjectMapper objectMapper, @Value("${gemini.api.key:}") String apiKey,
			@Value("${gemini.api.model:gemini-2.5-flash}") String model) {
		this.reportService = reportService;
		this.categoryRepository = categoryRepository;
		this.walletRepository = walletRepository;
		this.walletService = walletService;
		this.securityUtils = securityUtils;
		this.objectMapper = objectMapper;
		this.restClient = RestClient.create();
		this.apiKey = apiKey;
		this.model = model;
	}

	public AiInsightResponseDTO generateInsights(Long walletId, LocalDate startDate, LocalDate endDate) {
		ReportStatementDTO statement = reportService.getStatement(walletId, null, null, startDate, endDate);

		if (statement.transactionCount() == 0) {
			return new AiInsightResponseDTO(
					"Nenhuma transação registrada no período selecionado para gerar análise.",
					List.of("Registre receitas ou despesas na carteira para obter insights personalizados."),
					"Adicione seus primeiros lançamentos e gere a análise novamente.",
					model);
		}

		ensureApiKey();

		String categoriesText = statement.byCategory().stream()
				.map(c -> "- " + c.categoryName() + ": R$ " + c.total())
				.collect(Collectors.joining("\n"));

		String sampleTxText = statement.transactions().stream().limit(15)
				.map(t -> "- " + t.date() + " | " + t.type() + " | R$ " + t.amount() + " | "
						+ (t.categoryName() != null ? t.categoryName() : "Sem categoria") + " | "
						+ (t.description() != null ? t.description() : "Sem descrição"))
				.collect(Collectors.joining("\n"));

		String prompt = """
				Você é um analista financeiro objetivo. Analise os dados reais abaixo em português do Brasil e responda EXCLUSIVAMENTE com um JSON válido no formato:
				{"summary": "resumo em 2 frases", "highlights": ["ponto 1", "ponto 2", "ponto 3"], "recommendation": "1 recomendação prática"}

				Carteira: %s
				Receitas totais: R$ %s
				Despesas totais: R$ %s
				Saldo do período: R$ %s
				Quantidade de lançamentos: %d

				Totais por categoria:
				%s

				Amostra de lançamentos recentes:
				%s
				""".formatted(statement.walletName(), statement.totalIncome(), statement.totalExpense(),
				statement.balance(), statement.transactionCount(),
				categoriesText.isEmpty() ? "Nenhum" : categoriesText,
				sampleTxText.isEmpty() ? "Nenhum" : sampleTxText);

		String rawJson = callGeminiJson(prompt);
		return parseInsightResponse(rawJson);
	}

	public AiCategorizeResponseDTO suggestCategory(Long walletId, AiCategorizeRequestDTO dto) {
		User user = securityUtils.getAuthenticatedUser();
		Wallet wallet = walletRepository.findById(walletId)
				.orElseThrow(() -> new RuntimeException("Carteira não encontrada"));
		walletService.checkMemberAccess(wallet, user.getId());

		List<Category> categories = categoryRepository.findByUserIdAndType(user.getId(), dto.type());
		if (categories.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Cadastre ao menos uma categoria deste tipo antes de usar a sugestão com IA.");
		}

		ensureApiKey();

		String options = categories.stream()
				.map(c -> "- id=" + c.getId() + ", nome=\"" + c.getName() + "\"")
				.collect(Collectors.joining("\n"));

		String prompt = """
				Escolha a categoria mais adequada da lista abaixo para o lançamento informado.
				Responda EXCLUSIVAMENTE com um JSON válido no formato:
				{"categoryId": 123, "reason": "motivo curto em português"}

				Descrição do lançamento: "%s"
				Tipo: %s

				Categorias disponíveis:
				%s
				""".formatted(dto.description(), dto.type(), options);

		String rawJson = callGeminiJson(prompt);
		return parseCategorizeResponse(rawJson, categories);
	}

	private void ensureApiKey() {
		if (apiKey == null || apiKey.isBlank()) {
			throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
					"Integração com IA não configurada. Defina GEMINI_API_KEY no backend.");
		}
	}

	private String callGeminiJson(String prompt) {
		Map<String, Object> body = Map.of(
				"contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
				"generationConfig", Map.of("responseMimeType", "application/json", "temperature", 0.2));

		try {
			String responseBody = restClient.post()
					.uri(GEMINI_BASE_URL + model + ":generateContent?key=" + apiKey)
					.contentType(MediaType.APPLICATION_JSON)
					.body(body)
					.retrieve()
					.body(String.class);

			JsonNode root = objectMapper.readTree(responseBody);
			JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
			if (textNode.isMissingNode() || textNode.asText().isBlank()) {
				throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
						"Resposta vazia retornada pelo provedor de IA.");
			}
			return stripCodeFence(textNode.asText());
		} catch (ResponseStatusException ex) {
			throw ex;
		} catch (RestClientException ex) {
			throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
					"Não foi possível consultar a API do Gemini no momento. Verifique a chave ou a cota gratuita.");
		} catch (Exception ex) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"Erro ao processar a resposta da IA.");
		}
	}

	private AiInsightResponseDTO parseInsightResponse(String rawJson) {
		try {
			JsonNode node = objectMapper.readTree(rawJson);
			String summary = node.path("summary").asText("Análise concluída.");
			List<String> highlights = new ArrayList<>();
			JsonNode highlightsNode = node.path("highlights");
			if (highlightsNode.isArray()) {
				for (JsonNode item : highlightsNode) {
					if (!item.asText().isBlank()) {
						highlights.add(item.asText());
					}
				}
			}
			String recommendation = node.path("recommendation").asText("");
			return new AiInsightResponseDTO(summary, highlights, recommendation, model);
		} catch (Exception ex) {
			return new AiInsightResponseDTO(rawJson, List.of(), "", model);
		}
	}

	private AiCategorizeResponseDTO parseCategorizeResponse(String rawJson, List<Category> categories) {
		try {
			JsonNode node = objectMapper.readTree(rawJson);
			long suggestedId = node.path("categoryId").asLong(-1L);
			String reason = node.path("reason").asText("Categoria sugerida com base na descrição.");

			Category matched = categories.stream()
					.filter(c -> c.getId().equals(suggestedId))
					.findFirst()
					.orElse(categories.get(0));

			return new AiCategorizeResponseDTO(matched.getId(), matched.getName(), reason);
		} catch (Exception ex) {
			Category fallback = categories.get(0);
			return new AiCategorizeResponseDTO(fallback.getId(), fallback.getName(),
					"Sugestão padrão aplicada.");
		}
	}

	private String stripCodeFence(String text) {
		String trimmed = text.trim();
		if (trimmed.startsWith("```")) {
			int firstNewline = trimmed.indexOf('\n');
			if (firstNewline > 0) {
				trimmed = trimmed.substring(firstNewline + 1);
			}
			if (trimmed.endsWith("```")) {
				trimmed = trimmed.substring(0, trimmed.length() - 3);
			}
		}
		return trimmed.trim();
	}
}
