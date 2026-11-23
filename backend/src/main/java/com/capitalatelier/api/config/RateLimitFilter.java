package com.capitalatelier.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class RateLimitFilter extends OncePerRequestFilter {

	private static final long WINDOW_MILLIS = 60_000L;
	private static final Map<String, Integer> ROUTE_LIMITS = Map.of(
			"/auth/login", 10,
			"/auth/register", 5,
			"/auth/forgot-password", 5,
			"/auth/reset-password", 5);

	private final Map<String, Deque<Long>> requestTimestamps = new ConcurrentHashMap<>();

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		if (!"POST".equalsIgnoreCase(request.getMethod())) {
			filterChain.doFilter(request, response);
			return;
		}

		String uri = request.getRequestURI();
		Integer maxRequests = ROUTE_LIMITS.get(uri);
		if (maxRequests == null) {
			filterChain.doFilter(request, response);
			return;
		}

		String clientIp = resolveClientIp(request);
		String key = clientIp + ":" + uri;

		if (!isAllowed(key, maxRequests, System.currentTimeMillis())) {
			response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
			response.setHeader("Retry-After", "60");
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			response.setCharacterEncoding(StandardCharsets.UTF_8.name());
			response.getWriter()
					.write("{\"message\":\"Muitas tentativas em sequência. Aguarde um minuto e tente novamente.\"}");
			return;
		}

		filterChain.doFilter(request, response);
	}

	public boolean isAllowed(String key, int maxRequests, long nowMillis) {
		Deque<Long> timestamps = requestTimestamps.computeIfAbsent(key, k -> new ArrayDeque<>());
		synchronized (timestamps) {
			long cutoff = nowMillis - WINDOW_MILLIS;
			while (!timestamps.isEmpty() && timestamps.peekFirst() <= cutoff) {
				timestamps.pollFirst();
			}
			if (timestamps.size() >= maxRequests) {
				return false;
			}
			timestamps.addLast(nowMillis);
			return true;
		}
	}

	private String resolveClientIp(HttpServletRequest request) {
		String forwardedFor = request.getHeader("X-Forwarded-For");
		if (forwardedFor != null && !forwardedFor.isBlank()) {
			return forwardedFor.split(",")[0].trim();
		}
		return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
	}
}
