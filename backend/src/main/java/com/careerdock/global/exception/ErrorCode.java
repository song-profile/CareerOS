package com.careerdock.global.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "잘못된 요청입니다."),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "입력값을 확인해주세요."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "로그인이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "NOT_FOUND", "요청한 데이터를 찾을 수 없습니다."),
    CONFLICT(HttpStatus.CONFLICT, "CONFLICT", "현재 상태에서는 요청을 처리할 수 없습니다."),
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", "이미 존재하는 데이터입니다."),
    FILE_ERROR(HttpStatus.BAD_REQUEST, "FILE_ERROR", "파일을 처리할 수 없습니다."),
    GOOGLE_NOT_CONNECTED(HttpStatus.CONFLICT, "GOOGLE_NOT_CONNECTED", "Google Calendar가 연결되어 있지 않습니다."),
    // 401(UNAUTHORIZED)은 CareerDock 로그인 자체가 필요하다는 의미로 이미 쓰이고 있어,
    // Calendar 재동의가 필요한 상황과 섞이지 않도록 409로 구분한다.
    GOOGLE_TOKEN_EXPIRED(HttpStatus.CONFLICT, "GOOGLE_TOKEN_EXPIRED", "Google Calendar 연결이 만료되었습니다. 다시 연결해주세요."),
    GOOGLE_CALENDAR_FORBIDDEN(HttpStatus.FORBIDDEN, "GOOGLE_CALENDAR_FORBIDDEN", "Google Calendar 접근 권한이 없습니다."),
    GOOGLE_CALENDAR_API_DISABLED(HttpStatus.BAD_GATEWAY, "GOOGLE_CALENDAR_API_DISABLED", "Google Calendar API가 활성화되어 있지 않습니다."),
    GOOGLE_API_ERROR(HttpStatus.BAD_GATEWAY, "GOOGLE_API_ERROR", "Google Calendar 요청 처리 중 오류가 발생했습니다."),
    GOOGLE_RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS, "GOOGLE_RATE_LIMITED", "Google Calendar 요청이 많아 잠시 후 다시 시도해주세요."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }

    public HttpStatus httpStatus() {
        return httpStatus;
    }

    public String code() {
        return code;
    }

    public String message() {
        return message;
    }
}
