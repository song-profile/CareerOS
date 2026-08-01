package com.careerdock.global.exception;

public class ConflictException extends CareerdockException {

    public ConflictException(String message) {
        super(ErrorCode.CONFLICT, message);
    }
}
