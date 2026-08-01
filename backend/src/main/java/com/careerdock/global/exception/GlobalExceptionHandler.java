package com.careerdock.global.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";

    @ExceptionHandler(CareerdockException.class)
    public ResponseEntity<ErrorResponse> handleCareerdockException(
            CareerdockException exception,
            HttpServletRequest request
    ) {
        ErrorCode errorCode = exception.errorCode();
        ErrorResponse response = ErrorResponse.of(
                errorCode.httpStatus().value(),
                errorCode.code(),
                exception.getMessage(),
                request.getRequestURI(),
                request.getHeader(REQUEST_ID_HEADER)
        );
        return ResponseEntity.status(errorCode.httpStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fieldError.getField(), toFieldErrorMessage(fieldError));
        }

        ErrorResponse response = new ErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                ErrorCode.VALIDATION_ERROR.code(),
                ErrorCode.VALIDATION_ERROR.message(),
                fieldErrors,
                request.getRequestURI(),
                request.getHeader(REQUEST_ID_HEADER)
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                ErrorCode.VALIDATION_ERROR.code(),
                ErrorCode.VALIDATION_ERROR.message(),
                request.getRequestURI(),
                request.getHeader(REQUEST_ID_HEADER)
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception exception, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ErrorCode.INTERNAL_SERVER_ERROR.code(),
                ErrorCode.INTERNAL_SERVER_ERROR.message(),
                request.getRequestURI(),
                request.getHeader(REQUEST_ID_HEADER)
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private String toFieldErrorMessage(FieldError fieldError) {
        return fieldError.getDefaultMessage() == null
                ? ErrorCode.VALIDATION_ERROR.message()
                : fieldError.getDefaultMessage();
    }
}
