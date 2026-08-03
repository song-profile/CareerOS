package com.careerdock.calendar.service;

import com.careerdock.calendar.domain.RecruitmentEvent;
import com.careerdock.global.exception.CareerdockException;
import com.careerdock.global.exception.ErrorCode;
import com.careerdock.global.util.TimeZoneConstants;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Date;
import org.springframework.stereotype.Component;

/**
 * Google Calendar SDK를 감싸는 얇은 래퍼. 이 클래스 밖으로는 SDK의 체크 예외/응답 타입이
 * 새어나가지 않는다 — 성공은 SDK 모델 그대로, 실패는 {@link GoogleResourceNotFoundException}
 * 또는 {@link CareerdockException}으로만 던진다.
 *
 * 모든 호출은 CareerDock이 만든 보조 캘린더(calendarId) 안에서만 일어난다. 사용자의 기본
 * 캘린더 id를 여기 넘기는 코드는 없어야 한다 — 그 보장은 호출하는 쪽의 책임이다.
 */
@Component
public class GoogleCalendarApiClient {

    private static final String APPLICATION_NAME = "CareerDock";
    private static final String CALENDAR_SUMMARY = "CareerDock";
    private static final String CALENDAR_DESCRIPTION =
            "CareerDock이 만든 일정 전용 캘린더입니다. 이 캘린더의 일정만 CareerDock과 동기화됩니다.";
    private static final String TIME_ZONE = "Asia/Seoul";
    private static final String TEST_EVENT_SUMMARY = "CareerDock 연동 테스트";
    private static final String TEST_EVENT_DESCRIPTION = "Google Calendar 연결 확인용 이벤트입니다. 삭제해도 됩니다.";

    // ponytail: 인메모리 동기 재시도 2회. 요청량이 늘어 이 정도로 부족해지면 비동기 큐로 옮긴다.
    private static final int MAX_RETRIES = 2;
    private static final long[] BACKOFF_MILLIS = {500L, 1500L};

    private final HttpTransport httpTransport = new NetHttpTransport();
    private final JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

    /** 저장된 캘린더가 여전히 있으면 그대로, 없거나(404) 처음 연결이면 새로 만든다. */
    public String findOrCreateCalendar(Credential credential, String existingCalendarId) {
        Calendar client = client(credential);
        if (existingCalendarId != null && calendarExists(client, existingCalendarId)) {
            return existingCalendarId;
        }
        return createCalendar(client);
    }

    private boolean calendarExists(Calendar client, String calendarId) {
        try {
            withRetry(() -> client.calendars().get(calendarId).execute());
            return true;
        } catch (GoogleResourceNotFoundException notFound) {
            return false;
        }
    }

    private String createCalendar(Calendar client) {
        com.google.api.services.calendar.model.Calendar calendar = new com.google.api.services.calendar.model.Calendar();
        calendar.setSummary(CALENDAR_SUMMARY);
        calendar.setDescription(CALENDAR_DESCRIPTION);
        calendar.setTimeZone(TIME_ZONE);
        com.google.api.services.calendar.model.Calendar created =
                withRetry(() -> client.calendars().insert(calendar).execute());
        return created.getId();
    }

    public Event insertEvent(Credential credential, String calendarId, RecruitmentEvent event) {
        Calendar client = client(credential);
        return withRetry(() -> client.events().insert(calendarId, toGoogleEvent(event)).execute());
    }

    public Event updateEvent(Credential credential, String calendarId, String googleEventId, RecruitmentEvent event) {
        Calendar client = client(credential);
        return withRetry(() -> client.events().update(calendarId, googleEventId, toGoogleEvent(event)).execute());
    }

    public void deleteEvent(Credential credential, String calendarId, String googleEventId) {
        Calendar client = client(credential);
        withRetry(() -> {
            client.events().delete(calendarId, googleEventId).execute();
            return null;
        });
    }

    public Event insertTestEvent(Credential credential, String calendarId) {
        Calendar client = client(credential);
        Date now = new Date();
        Date thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000L);
        Event event = new Event()
                .setSummary(TEST_EVENT_SUMMARY)
                .setDescription(TEST_EVENT_DESCRIPTION)
                .setStart(new EventDateTime().setDateTime(new DateTime(now)).setTimeZone(TIME_ZONE))
                .setEnd(new EventDateTime().setDateTime(new DateTime(thirtyMinutesLater)).setTimeZone(TIME_ZONE));
        return withRetry(() -> client.events().insert(calendarId, event).execute());
    }

    private Calendar client(Credential credential) {
        return new Calendar.Builder(httpTransport, jsonFactory, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    private Event toGoogleEvent(RecruitmentEvent event) {
        Event googleEvent = new Event()
                .setSummary(event.getTitle())
                .setLocation(event.getLocation())
                .setDescription(event.getMemo());
        if (event.isAllDay()) {
            LocalDate startDate = event.getStartAt().atZone(TimeZoneConstants.DISPLAY_ZONE_KOREA).toLocalDate();
            // Google의 all-day end.date는 배타적 경계(다음날 자정)라, CareerDock이 저장한
            // "그날 23:59:59"를 하루 더해 변환한다.
            LocalDate endDateExclusive = event.getEndAt().atZone(TimeZoneConstants.DISPLAY_ZONE_KOREA)
                    .toLocalDate().plusDays(1);
            googleEvent.setStart(new EventDateTime().setDate(new DateTime(startDate.toString())));
            googleEvent.setEnd(new EventDateTime().setDate(new DateTime(endDateExclusive.toString())));
        } else {
            googleEvent.setStart(new EventDateTime()
                    .setDateTime(new DateTime(Date.from(event.getStartAt())))
                    .setTimeZone(TIME_ZONE));
            googleEvent.setEnd(new EventDateTime()
                    .setDateTime(new DateTime(Date.from(event.getEndAt())))
                    .setTimeZone(TIME_ZONE));
        }
        return googleEvent;
    }

    private <T> T withRetry(GoogleCall<T> call) {
        int attempt = 0;
        while (true) {
            try {
                return call.execute();
            } catch (GoogleJsonResponseException exception) {
                if (exception.getStatusCode() == 404) {
                    throw new GoogleResourceNotFoundException();
                }
                if (exception.getStatusCode() == 401) {
                    throw new CareerdockException(ErrorCode.GOOGLE_TOKEN_EXPIRED, ErrorCode.GOOGLE_TOKEN_EXPIRED.message());
                }
                if (isRateLimited(exception)) {
                    if (attempt < MAX_RETRIES) {
                        sleep(BACKOFF_MILLIS[attempt]);
                        attempt++;
                        continue;
                    }
                    throw new CareerdockException(ErrorCode.GOOGLE_RATE_LIMITED, ErrorCode.GOOGLE_RATE_LIMITED.message());
                }
                throw new CareerdockException(ErrorCode.GOOGLE_API_ERROR, ErrorCode.GOOGLE_API_ERROR.message());
            } catch (IOException exception) {
                if (attempt < MAX_RETRIES) {
                    sleep(BACKOFF_MILLIS[attempt]);
                    attempt++;
                    continue;
                }
                throw new CareerdockException(ErrorCode.GOOGLE_API_ERROR, ErrorCode.GOOGLE_API_ERROR.message());
            }
        }
    }

    private boolean isRateLimited(GoogleJsonResponseException exception) {
        if (exception.getStatusCode() == 429) {
            return true;
        }
        if (exception.getStatusCode() != 403 || exception.getDetails() == null) {
            return false;
        }
        return exception.getDetails().getErrors().stream()
                .map(GoogleJsonError.ErrorInfo::getReason)
                .anyMatch(reason -> "rateLimitExceeded".equals(reason) || "userRateLimitExceeded".equals(reason));
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException interruptedException) {
            Thread.currentThread().interrupt();
            throw new CareerdockException(ErrorCode.GOOGLE_API_ERROR, "Google Calendar 요청이 중단되었습니다.");
        }
    }

    @FunctionalInterface
    private interface GoogleCall<T> {
        T execute() throws IOException;
    }
}
