package com.careerdock.global.response;

public record ApiResponse<T>(
        boolean success,
        T data,
        String message,
        String requestId
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static <T> ApiResponse<T> failure(String message, String requestId) {
        return new ApiResponse<>(false, null, message, requestId);
    }
}
