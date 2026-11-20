package com.capitalatelier.api.dto;

import java.time.Instant;

public record RealtimeEventDTO(String type, Long walletId, String actorName, String message, Instant timestamp) {
}
