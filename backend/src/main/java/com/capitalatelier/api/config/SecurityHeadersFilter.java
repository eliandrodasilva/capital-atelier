package com.capitalatelier.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class SecurityHeadersFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		response.setHeader("X-Content-Type-Options", "nosniff");
		response.setHeader("X-Frame-Options", "DENY");
		response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
		response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

		String uri = request.getRequestURI();
		if ((uri.startsWith("/api/") || uri.startsWith("/auth/")) && !uri.endsWith("/events")) {
			response.setHeader("Cache-Control", "no-store");
		}

		String forwardedProto = request.getHeader("X-Forwarded-Proto");
		if (request.isSecure() || "https".equalsIgnoreCase(forwardedProto)) {
			response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
		}

		filterChain.doFilter(request, response);
	}
}
