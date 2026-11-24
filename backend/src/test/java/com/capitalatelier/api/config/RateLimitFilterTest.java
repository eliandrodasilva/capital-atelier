package com.capitalatelier.api.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateLimitFilterTest {

	private RateLimitFilter filter;

	@BeforeEach
	void setUp() {
		filter = new RateLimitFilter();
	}

	@Test
	void isAllowed_shouldBlockRequestsExceedingLimitWithinWindow() {
		long now = 1_000_000L;
		assertTrue(filter.isAllowed("127.0.0.1:/auth/login", 2, now));
		assertTrue(filter.isAllowed("127.0.0.1:/auth/login", 2, now + 1000));
		assertFalse(filter.isAllowed("127.0.0.1:/auth/login", 2, now + 2000));
	}

	@Test
	void isAllowed_shouldAllowRequestsAgainAfterWindowExpires() {
		long now = 1_000_000L;
		assertTrue(filter.isAllowed("127.0.0.1:/auth/register", 1, now));
		assertFalse(filter.isAllowed("127.0.0.1:/auth/register", 1, now + 30_000));
		assertTrue(filter.isAllowed("127.0.0.1:/auth/register", 1, now + 61_000));
	}

	@Test
	void doFilter_shouldReturn429WhenLoginLimitExceeded() throws Exception {
		for (int i = 0; i < 10; i++) {
			MockHttpServletRequest req = new MockHttpServletRequest("POST", "/auth/login");
			req.setRemoteAddr("10.0.0.5");
			MockHttpServletResponse res = new MockHttpServletResponse();
			filter.doFilter(req, res, new MockFilterChain());
			assertEquals(200, res.getStatus());
		}

		MockHttpServletRequest blockedReq = new MockHttpServletRequest("POST", "/auth/login");
		blockedReq.setRemoteAddr("10.0.0.5");
		MockHttpServletResponse blockedRes = new MockHttpServletResponse();
		filter.doFilter(blockedReq, blockedRes, new MockFilterChain());

		assertEquals(429, blockedRes.getStatus());
		assertEquals("60", blockedRes.getHeader("Retry-After"));
	}
}
