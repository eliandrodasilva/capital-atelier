package com.capitalatelier.api.service;

import com.capitalatelier.api.dto.RealtimeEventDTO;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class RealtimeService {

	private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emittersByWallet = new ConcurrentHashMap<>();
	private final ScheduledExecutorService heartbeatExecutor = Executors.newSingleThreadScheduledExecutor(r -> {
		Thread t = new Thread(r, "sse-heartbeat");
		t.setDaemon(true);
		return t;
	});

	public RealtimeService() {
		heartbeatExecutor.scheduleAtFixedRate(this::sendHeartbeats, 25, 25, TimeUnit.SECONDS);
	}

	public SseEmitter subscribe(Long walletId) {
		SseEmitter emitter = new SseEmitter(0L);
		CopyOnWriteArrayList<SseEmitter> emitters = emittersByWallet.computeIfAbsent(walletId,
				k -> new CopyOnWriteArrayList<>());
		emitters.add(emitter);

		Runnable removeEmitter = () -> remove(walletId, emitter);
		emitter.onCompletion(removeEmitter);
		emitter.onTimeout(removeEmitter);
		emitter.onError(ex -> removeEmitter.run());

		try {
			RealtimeEventDTO connected = new RealtimeEventDTO("CONNECTED", walletId, "system",
					"Conectado às atualizações em tempo real", Instant.now());
			emitter.send(SseEmitter.event().name("CONNECTED").data(connected));
		} catch (IOException ex) {
			remove(walletId, emitter);
		}

		return emitter;
	}

	public void publish(Long walletId, RealtimeEventDTO event) {
		List<SseEmitter> emitters = emittersByWallet.get(walletId);
		if (emitters == null || emitters.isEmpty()) {
			return;
		}

		for (SseEmitter emitter : emitters) {
			try {
				emitter.send(SseEmitter.event().name(event.type()).data(event));
			} catch (IOException | IllegalStateException ex) {
				remove(walletId, emitter);
			}
		}
	}

	private void sendHeartbeats() {
		emittersByWallet.forEach((walletId, emitters) -> {
			for (SseEmitter emitter : emitters) {
				try {
					emitter.send(SseEmitter.event().comment("heartbeat"));
				} catch (IOException | IllegalStateException ex) {
					remove(walletId, emitter);
				}
			}
		});
	}

	private void remove(Long walletId, SseEmitter emitter) {
		CopyOnWriteArrayList<SseEmitter> emitters = emittersByWallet.get(walletId);
		if (emitters != null) {
			emitters.remove(emitter);
			if (emitters.isEmpty()) {
				emittersByWallet.remove(walletId, emitters);
			}
		}
	}

	@PreDestroy
	public void shutdown() {
		heartbeatExecutor.shutdownNow();
	}
}
