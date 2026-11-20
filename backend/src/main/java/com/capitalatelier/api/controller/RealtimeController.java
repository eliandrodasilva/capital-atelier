package com.capitalatelier.api.controller;

import com.capitalatelier.api.model.User;
import com.capitalatelier.api.model.Wallet;
import com.capitalatelier.api.repository.WalletRepository;
import com.capitalatelier.api.service.RealtimeService;
import com.capitalatelier.api.service.WalletService;
import com.capitalatelier.api.util.SecurityUtils;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/wallets/{walletId}/events")
@CrossOrigin(origins = "*")
public class RealtimeController {

	private final RealtimeService realtimeService;
	private final WalletRepository walletRepository;
	private final WalletService walletService;
	private final SecurityUtils securityUtils;

	public RealtimeController(RealtimeService realtimeService, WalletRepository walletRepository,
			WalletService walletService, SecurityUtils securityUtils) {
		this.realtimeService = realtimeService;
		this.walletRepository = walletRepository;
		this.walletService = walletService;
		this.securityUtils = securityUtils;
	}

	@GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public SseEmitter streamWalletEvents(@PathVariable Long walletId) {
		User user = securityUtils.getAuthenticatedUser();
		Wallet wallet = walletRepository.findById(walletId)
				.orElseThrow(() -> new RuntimeException("Carteira não encontrada"));

		walletService.checkMemberAccess(wallet, user.getId());
		return realtimeService.subscribe(walletId);
	}
}
