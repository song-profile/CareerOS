package com.careerdock.global.exception;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ExceptionTestController {

    @PostMapping("/test/validation")
    void validation(@Valid @RequestBody ValidationTestRequest request) {
    }

    @GetMapping("/test/not-found")
    void notFound() {
        throw new NotFoundException("테스트 데이터를 찾을 수 없습니다.");
    }

    @GetMapping("/test/conflict")
    void conflict() {
        throw new ConflictException("테스트 상태 충돌입니다.");
    }

    record ValidationTestRequest(
            @NotBlank(message = "이메일은 필수입니다.")
            @Email(message = "올바른 이메일 형식이 아닙니다.")
            String email
    ) {
    }
}
