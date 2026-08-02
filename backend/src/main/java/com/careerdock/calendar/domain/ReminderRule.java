package com.careerdock.calendar.domain;

import com.careerdock.global.domain.BaseTimeEntity;
import com.careerdock.global.exception.BadRequestException;
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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.List;

@Entity
@Table(
        name = "reminder_rules",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_reminder_rules_event_minutes_channel",
                        columnNames = {"event_id", "minutes_before", "channel"}
                )
        }
)
public class ReminderRule extends BaseTimeEntity {

    /** 7일 전, 3일 전, 1일 전, 당일 3시간 전. 요청에 알림이 없으면 이 규칙을 넣는다. */
    private static final List<Integer> DEFAULT_MINUTES_BEFORE = List.of(10080, 4320, 1440, 180);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private RecruitmentEvent event;

    @Column(name = "minutes_before", nullable = false)
    private int minutesBefore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReminderChannel channel;

    @Column(nullable = false)
    private boolean enabled;

    protected ReminderRule() {
    }

    public static ReminderRule create(RecruitmentEvent event, int minutesBefore, ReminderChannel channel, boolean enabled) {
        if (minutesBefore < 0) {
            throw new BadRequestException("알림 시점은 0분 이상이어야 합니다.");
        }
        ReminderRule rule = new ReminderRule();
        rule.event = event;
        rule.minutesBefore = minutesBefore;
        rule.channel = channel == null ? ReminderChannel.INTERNAL : channel;
        rule.enabled = enabled;
        return rule;
    }

    public static List<ReminderRule> defaultsFor(RecruitmentEvent event) {
        return DEFAULT_MINUTES_BEFORE.stream()
                .map(minutes -> create(event, minutes, ReminderChannel.INTERNAL, true))
                .toList();
    }

    public Long getId() { return id; }

    public RecruitmentEvent getEvent() { return event; }

    public int getMinutesBefore() { return minutesBefore; }

    public ReminderChannel getChannel() { return channel; }

    public boolean isEnabled() { return enabled; }
}
