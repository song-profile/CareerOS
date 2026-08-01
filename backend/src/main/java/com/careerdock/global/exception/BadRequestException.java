package com.careerdock.global.exception;

public class BadRequestException extends CareerdockException {

    public BadRequestException(String message) {
        super(ErrorCode.BAD_REQUEST, message);
    }
}
