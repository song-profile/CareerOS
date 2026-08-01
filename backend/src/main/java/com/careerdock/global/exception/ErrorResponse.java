package com.careerdock.global.exception;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
        Instant timestamp,
        int status,
        String code,
        String message,
        Map<String, String> fieldErrors,
        String path,
        String requestId
) {
    public static ErrorResponse of(int status, String code, String message, String path, String requestId) {
        return new ErrorResponse(Instant.now(), status, code, message, Map.of(), path, requestId);
    }
}
