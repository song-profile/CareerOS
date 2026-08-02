package com.careerdock.calendar.dto;

import com.careerdock.calendar.domain.EventType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import org.hibernate.validator.constraints.URL;

/**
 * 등록·수정 공통 요청. PATCH도 전체 교체 방식이라 자소서·자격증 요청과 규칙이 같다.
 *
 * applicationId를 비우면 개인 일정이다. userId는 받지 않는다. 소유자는 언제나 세션에서 온다.
 * reminderRules를 아예 보내지 않으면 기본 알림(7일·3일·1일 전, 당일 3시간 전)이 붙고,
 * 빈 배열을 보내면 알림 없이 저장한다. 둘을 구분해야 알림을 모두 끄는 요청을 표현할 수 있다.
 */
public record RecruitmentEventRequest(
        Long applicationId,

        @NotNull(message = "일정 종류는 필수입니다.")
        EventType eventType,

        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 150, message = "제목은 150자 이하여야 합니다.")
        String title,

        @NotNull(message = "시작 일시는 필수입니다.")
        Instant startAt,

        Instant endAt,

        boolean allDay,

        @Size(max = 200, message = "장소는 200자 이하여야 합니다.")
        String location,

        @URL(message = "온라인 링크 형식이 올바르지 않습니다.")
        @Size(max = 1000, message = "온라인 링크는 1000자 이하여야 합니다.")
        String onlineUrl,

        @Size(max = 1000, message = "메모는 1000자 이하여야 합니다.")
        String memo,

        @Valid
        List<ReminderRuleRequest> reminderRules
) {
    @AssertTrue(message = "종료 일시는 시작 일시보다 이전일 수 없습니다.")
    public boolean isPeriodValid() {
        return startAt == null || endAt == null || !endAt.isBefore(startAt);
    }
}
