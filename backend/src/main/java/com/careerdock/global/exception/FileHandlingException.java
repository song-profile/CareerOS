package com.careerdock.global.exception;

public class FileHandlingException extends CareerdockException {

    public FileHandlingException(String message) {
        super(ErrorCode.FILE_ERROR, message);
    }
}
