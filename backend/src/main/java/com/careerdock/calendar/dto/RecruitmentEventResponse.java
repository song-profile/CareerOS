package com.careerdock.calendar.dto;

import com.careerdock.application.domain.Application;
import com.careerdock.calendar.domain.EventType;
import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.calendar.domain.SyncStatus;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/**
 * 목록·상세 공통 응답.
 *
 * 캘린더 화면은 일정마다 회사명과 직무명을 함께 보여준다. id만 내려주면 클라이언트가 일정 수만큼
 * 지원 건을 다시 조회해야 해서 이름까지 담는다. 개인 일정은 셋 다 null이다.
 */
public record RecruitmentEventResponse(
        Long id,
        Long applicationId,
        String companyName,
        String positionName,
        EventType eventType,
        String title,
        Instant startAt,
        Instant endAt,
        boolean allDay,
        String location,
        String onlineUrl,
        String memo,
        String googleEventId,
        SyncStatus syncStatus,
        String syncFailureReason,
        List<ReminderRuleResponse> reminderRules,
        Instant createdAt,
        Instant updatedAt
) {
    public static RecruitmentEventResponse from(RecruitmentEvent event) {
        Application application = event.getApplication();
        return new RecruitmentEventResponse(
                event.getId(),
                application == null ? null : application.getId(),
                application == null ? null : application.getCompany().getName(),
                application == null ? null : application.getPositionName(),
                event.getEventType(),
                event.getTitle(),
                event.getStartAt(),
                event.getEndAt(),
                event.isAllDay(),
                event.getLocation(),
                event.getOnlineUrl(),
                event.getMemo(),
                event.getGoogleEventId(),
                event.getSyncStatus(),
                event.getSyncFailureReason(),
                event.getReminderRules().stream()
                        .sorted(Comparator.comparingInt(rule -> -rule.getMinutesBefore()))
                        .map(ReminderRuleResponse::from)
                        .toList(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}
