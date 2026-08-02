package com.careerdock.calendar.service;

import com.careerdock.application.domain.Application;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.calendar.domain.ReminderRule;
import com.careerdock.calendar.dto.EventSearchCondition;
import com.careerdock.calendar.dto.RecruitmentEventRequest;
import com.careerdock.calendar.dto.RecruitmentEventResponse;
import com.careerdock.calendar.dto.ReminderRuleRequest;
import com.careerdock.calendar.repository.RecruitmentEventRepository;
import com.careerdock.global.exception.BadRequestException;
import com.careerdock.global.exception.NotFoundException;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CalendarService {

    private static final int DEFAULT_UPCOMING_LIMIT = 10;
    private static final int MAX_UPCOMING_LIMIT = 100;

    private final RecruitmentEventRepository eventRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public CalendarService(
            RecruitmentEventRepository eventRepository,
            ApplicationRepository applicationRepository,
            UserRepository userRepository
    ) {
        this.eventRepository = eventRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<RecruitmentEventResponse> findAll(Long userId, EventSearchCondition condition) {
        Sort sort = Sort.by(Sort.Order.asc("startAt"), Sort.Order.asc("id"));
        Instant start = condition.start();
        if (condition.upcoming()) {
            // 아직 끝나지 않은 일정이 다가오는 일정이다. 진행 중인 면접이 목록에서 사라지면 안 된다.
            start = start == null ? Instant.now() : start;
        }
        var effectiveCondition = new EventSearchCondition(
                start, condition.end(), condition.upcoming(), condition.limit(),
                condition.applicationId(), condition.eventType());
        var spec = RecruitmentEventSpecifications.byCondition(userId, effectiveCondition);

        List<RecruitmentEvent> events = condition.upcoming()
                ? eventRepository.findAll(spec, PageRequest.of(0, upcomingLimit(condition.limit()), sort)).getContent()
                : eventRepository.findAll(spec, sort);
        return events.stream().map(RecruitmentEventResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public RecruitmentEventResponse findOne(Long userId, Long eventId) {
        return RecruitmentEventResponse.from(getEvent(userId, eventId));
    }

    @Transactional
    public RecruitmentEventResponse create(Long userId, RecruitmentEventRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        RecruitmentEvent event = RecruitmentEvent.create(
                user,
                resolveApplication(userId, request.applicationId()),
                request.eventType(),
                request.title(),
                request.startAt(),
                request.endAt(),
                request.allDay(),
                request.location(),
                request.onlineUrl(),
                request.memo()
        );
        event.replaceReminderRules(toReminderRules(event, request.reminderRules()));
        return RecruitmentEventResponse.from(eventRepository.save(event));
    }

    @Transactional
    public RecruitmentEventResponse update(Long userId, Long eventId, RecruitmentEventRequest request) {
        RecruitmentEvent event = getEvent(userId, eventId);
        event.update(
                resolveApplication(userId, request.applicationId()),
                request.eventType(),
                request.title(),
                request.startAt(),
                request.endAt(),
                request.allDay(),
                request.location(),
                request.onlineUrl(),
                request.memo()
        );
        event.replaceReminderRules(toReminderRules(event, request.reminderRules()));
        return RecruitmentEventResponse.from(event);
    }

    @Transactional
    public void delete(Long userId, Long eventId) {
        eventRepository.delete(getEvent(userId, eventId));
    }

    private RecruitmentEvent getEvent(Long userId, Long eventId) {
        // 남의 일정은 존재 자체를 알리지 않는다. 권한 없음 대신 404로 응답한다.
        return eventRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new NotFoundException("일정을 찾을 수 없습니다."));
    }

    /** 남의 지원 건에 일정을 붙이지 못하게 막는다. 남의 지원 건은 없는 것으로 답한다. */
    private Application resolveApplication(Long userId, Long applicationId) {
        if (applicationId == null) {
            return null;
        }
        return applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new NotFoundException("연결할 지원 건을 찾을 수 없습니다."));
    }

    private List<ReminderRule> toReminderRules(RecruitmentEvent event, List<ReminderRuleRequest> requests) {
        if (requests == null) {
            return ReminderRule.defaultsFor(event);
        }
        return requests.stream()
                .map(rule -> ReminderRule.create(
                        event, rule.minutesBefore(), rule.channelOrDefault(), rule.enabledOrDefault()))
                .toList();
    }

    private int upcomingLimit(Integer limit) {
        if (limit == null) {
            return DEFAULT_UPCOMING_LIMIT;
        }
        if (limit < 1 || limit > MAX_UPCOMING_LIMIT) {
            throw new BadRequestException("limit은 1 이상 " + MAX_UPCOMING_LIMIT + " 이하여야 합니다.");
        }
        return limit;
    }
}
