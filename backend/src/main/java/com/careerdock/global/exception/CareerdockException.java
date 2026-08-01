package com.careerdock.global.exception;

public class CareerdockException extends RuntimeException {

    private final ErrorCode errorCode;

    public CareerdockException(ErrorCode errorCode) {
        super(errorCode.message());
        this.errorCode = errorCode;
    }

    public CareerdockException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public ErrorCode errorCode() {
        return errorCode;
    }
}
