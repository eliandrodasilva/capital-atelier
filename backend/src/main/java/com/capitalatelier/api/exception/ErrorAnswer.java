package com.capitalatelier.api.exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErrorAnswer {
    private int status;
    private String message;
    private LocalDateTime dateTime;
}
