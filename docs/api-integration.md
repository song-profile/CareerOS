# CareerDock API Integration Notes

작성 기준: 현재 저장소 구현

## 기준 문서

상세 API 계약은 [docs/api-spec.md](api-spec.md)를 기준으로 한다.

이 문서는 프론트와 백엔드 연동 원칙을 요약한다.

## 현재 연동 상태

현재 프론트는 다음 기능을 실제 Spring Boot API와 연결한다.

- 인증: `/api/auth/me`, Google OAuth 시작 URL
- 대시보드: `/api/dashboard/summary`
- 지원관리: `/api/applications`
- 자소서: `/api/essays`, `/api/essay-questions`, `/api/essay-answers`, `/api/experience-tags`
- 내 자료: `/api/credentials`, `/api/external-links`, `/api/files`
- 캘린더: `/api/calendar/events`
- 지원 건 자료 연결: `/api/applications/{applicationId}/resources` 및 하위 연결 API

## 인증 방식

- Spring Security Session + HttpOnly `JSESSIONID` Cookie
- 프론트 요청은 공통 API client를 통해 `credentials: "include"`를 사용한다.
- request body나 query parameter로 `userId`를 보내지 않는다.
- 인증이 필요한 API는 세션이 없으면 `401 UNAUTHORIZED`를 반환한다.

## 프론트 연동 원칙

- endpoint 문자열은 `src/lib/api/endpoints.ts`에서 관리한다.
- 컴포넌트에서 API URL을 직접 작성하지 않는다.
- 기능별 API 모듈은 `src/features/*/api` 아래에 둔다.
- backend DTO와 화면 ViewModel이 다르면 mapper를 둔다.
- mock fallback으로 성공처럼 보이게 하지 않는다.
- API 오류, 빈 데이터, loading 상태를 구분한다.
- `FormData` 업로드에서는 `Content-Type`을 직접 설정하지 않는다.

## 오류 처리

공통 API client는 HTTP 상태를 `ApiClientError.kind`로 변환한다.

- `network`
- `unauthorized`
- `forbidden`
- `notFound`
- `conflict`
- `validation`
- `server`
- `api`

화면에서는 최소한 인증 필요, 네트워크 오류, 서버 오류, 데이터 없음 상태를 구분한다.

## 날짜 처리

- `Instant`: `2026-08-02T00:00:00Z` 형식
- `LocalDate`: `2026-08-02` 형식
- 캘린더 종일 일정은 서버에서 한국 날짜 하루 경계를 기준으로 처리한다.
- 프론트는 화면 표시 시 한국 시간 기준으로 포맷한다.

## Multipart

파일 업로드:

```text
POST /api/files
Content-Type: multipart/form-data
```

필드:

- `file`: 파일 본문
- `category`: 파일 분류
- `displayName`: 표시 이름, 선택

허용 파일과 최대 크기는 backend 설정과 `docs/api-spec.md`를 따른다.

## 남은 문서화 과제

- OpenAPI/Swagger 자동 문서는 아직 없다.
- 운영 배포용 reverse proxy, HTTPS 설정 문서는 별도 작성이 필요하다.
- Google Calendar 연결/상태/재동기화/연결 해제 UI는 `/settings/calendar`에서 제공한다.
