package com.careerdock.calendar.domain;

import com.careerdock.application.domain.Application;
import com.careerdock.global.domain.BaseTimeEntity;
import com.careerdock.global.exception.BadRequestException;
import com.careerdock.global.exception.DuplicateResourceException;
import com.careerdock.global.util.TimeZoneConstants;
import com.careerdock.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.hibernate.annotations.BatchSize;

@Entity
@Table(name = "recruitment_events")
public class RecruitmentEvent extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** 개인 일정은 지원 건 없이 존재한다. 연결할 때는 서비스가 소유자를 먼저 확인한다. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 40)
    private EventType eventType;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    /**
     * 요청에서 비어 오면 시작과 같은 시각으로 채운다. null을 허용하면 월간 범위 조회가
     * 매번 coalesce를 써야 하고, 종일 일정과 시점 일정의 처리가 갈린다.
     */
    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Column(name = "all_day", nullable = false)
    private boolean allDay;

    @Column(length = 200)
    private String location;

    @Column(name = "online_url", length = 1000)
    private String onlineUrl;

    @Column(length = 1000)
    private String memo;

    @Column(name = "google_event_id", length = 200)
    private String googleEventId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_status", nullable = false, length = 20)
    private SyncStatus syncStatus;

    @Column(name = "sync_failure_reason", length = 500)
    private String syncFailureReason;

    /**
     * 지연 로딩 컬렉션. 일정마다 알림을 한 번씩 더 읽는 대신, 한 트랜잭션 안의 일정들을
     * IN 절로 묶어 한 번에 가져온다. 월간 조회처럼 여러 일정을 한 번에 응답할 때 효과가 있다.
     */
    @BatchSize(size = 50)
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReminderRule> reminderRules = new ArrayList<>();

    protected RecruitmentEvent() {
    }

    private RecruitmentEvent(User user) {
        this.user = user;
        this.syncStatus = SyncStatus.NOT_CONNECTED;
    }

    public static RecruitmentEvent create(
            User user,
            Application application,
            EventType eventType,
            String title,
            Instant startAt,
            Instant endAt,
            boolean allDay,
            String location,
            String onlineUrl,
            String memo
    ) {
        RecruitmentEvent event = new RecruitmentEvent(user);
        event.apply(application, eventType, title, startAt, endAt, allDay, location, onlineUrl, memo);
        return event;
    }

    public void update(
            Application application,
            EventType eventType,
            String title,
            Instant startAt,
            Instant endAt,
            boolean allDay,
            String location,
            String onlineUrl,
            String memo
    ) {
        apply(application, eventType, title, startAt, endAt, allDay, location, onlineUrl, memo);
    }

    /**
     * 알림 규칙 전체 교체. 같은 (시점, 채널)이 두 번 들어오면 거절한다.
     *
     * DB에도 같은 유니크 제약이 있지만, 여기서 먼저 막아야 사용자가 500 대신 이유를 받는다.
     */
    public void replaceReminderRules(List<ReminderRule> rules) {
        Set<String> seen = new HashSet<>();
        for (ReminderRule rule : rules) {
            if (!seen.add(rule.getMinutesBefore() + ":" + rule.getChannel())) {
                throw new DuplicateResourceException("같은 시점과 채널의 알림이 이미 있습니다.");
            }
        }
        reminderRules.clear();
        reminderRules.addAll(rules);
    }

    /** Google Calendar push 성공. 다음 push부터는 이 id로 update를 호출한다. */
    public void markSynced(String googleEventId) {
        this.googleEventId = googleEventId;
        this.syncStatus = SyncStatus.SYNCED;
        this.syncFailureReason = null;
    }

    /** Google 쪽 실패(레이트리밋, 인증 만료, API 오류 등). CareerDock 쪽 데이터는 그대로 둔다. */
    public void markSyncFailed(String reason) {
        this.syncStatus = SyncStatus.FAILED;
        this.syncFailureReason = reason == null || reason.length() <= 500 ? reason : reason.substring(0, 500);
    }

    /**
     * Google 쪽에서 이 이벤트가 이미 사라진 경우(404). googleEventId를 비워 다음 재시도가
     * 새 이벤트로 다시 만들게 한다.
     */
    public void clearGoogleLink(String reason) {
        this.googleEventId = null;
        markSyncFailed(reason);
    }

    /** Calendar 연결 해제. 오류가 아니라 사용자가 스스로 끊은 것이라 FAILED가 아닌 NOT_CONNECTED로 되돌린다. */
    public void resetForDisconnect() {
        this.googleEventId = null;
        this.syncStatus = SyncStatus.NOT_CONNECTED;
        this.syncFailureReason = null;
    }

    private void apply(
            Application application,
            EventType eventType,
            String title,
            Instant startAt,
            Instant endAt,
            boolean allDay,
            String location,
            String onlineUrl,
            String memo
    ) {
        Instant resolvedStart = allDay ? startOfDayInKorea(startAt) : startAt;
        Instant resolvedEnd = resolveEnd(startAt, endAt, allDay);
        if (resolvedEnd.isBefore(resolvedStart)) {
            throw new BadRequestException("종료 일시는 시작 일시보다 이전일 수 없습니다.");
        }

        this.application = application;
        this.eventType = eventType;
        this.title = title.trim();
        this.startAt = resolvedStart;
        this.endAt = resolvedEnd;
        this.allDay = allDay;
        this.location = blankToNull(location);
        this.onlineUrl = blankToNull(onlineUrl);
        this.memo = blankToNull(memo);
    }

    /**
     * 종일 일정은 한국 날짜 하루를 통째로 차지한다. 사용자가 몇 시를 보냈든 그 날의 00:00부터
     * 23:59:59까지로 맞춘다. 저장은 UTC지만 하루의 경계는 사용자가 보는 한국 날짜 기준이어야 한다.
     */
    private Instant resolveEnd(Instant startAt, Instant endAt, boolean allDay) {
        Instant end = endAt == null ? startAt : endAt;
        if (!allDay) {
            return end;
        }
        LocalDate endDate = end.atZone(TimeZoneConstants.DISPLAY_ZONE_KOREA).toLocalDate();
        return endDate.plusDays(1).atStartOfDay(TimeZoneConstants.DISPLAY_ZONE_KOREA).minusSeconds(1).toInstant();
    }

    private Instant startOfDayInKorea(Instant instant) {
        return instant.atZone(TimeZoneConstants.DISPLAY_ZONE_KOREA)
                .toLocalDate()
                .atStartOfDay(TimeZoneConstants.DISPLAY_ZONE_KOREA)
                .toInstant();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    public Long getId() { return id; }

    public User getUser() { return user; }

    public Application getApplication() { return application; }

    public EventType getEventType() { return eventType; }

    public String getTitle() { return title; }

    public Instant getStartAt() { return startAt; }

    public Instant getEndAt() { return endAt; }

    public boolean isAllDay() { return allDay; }

    public String getLocation() { return location; }

    public String getOnlineUrl() { return onlineUrl; }

    public String getMemo() { return memo; }

    public String getGoogleEventId() { return googleEventId; }

    public SyncStatus getSyncStatus() { return syncStatus; }

    public String getSyncFailureReason() { return syncFailureReason; }

    public List<ReminderRule> getReminderRules() { return reminderRules; }
}
