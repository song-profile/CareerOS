package com.careerdock.global.exception;

public class DuplicateResourceException extends CareerdockException {

    public DuplicateResourceException(String message) {
        super(ErrorCode.DUPLICATE_RESOURCE, message);
    }
}
