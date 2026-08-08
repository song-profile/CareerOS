package com.careerdock.calendar.dto;

/** 프론트가 이 URL로 브라우저를 이동시켜 Google 동의 화면을 띄운다. */
public record CalendarConnectResponse(String authorizationUrl) {
}
