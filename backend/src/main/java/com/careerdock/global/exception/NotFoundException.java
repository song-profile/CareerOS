package com.careerdock.global.exception;

public class NotFoundException extends CareerdockException {

    public NotFoundException(String message) {
        super(ErrorCode.NOT_FOUND, message);
    }
}
