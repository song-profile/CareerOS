# CareerDock API Spec Draft

작성일: 2026-08-02

## Base URL

개발 기본값:

```text
http://localhost:8080
```

프론트엔드는 `NEXT_PUBLIC_API_BASE_URL` 환경변수로 백엔드 주소를 설정한다.

## 인증 방식

MVP 기준 인증 방식은 Spring Security Session + HttpOnly Cookie이다.

검토한 방식:

- A. Spring Security Session + HttpOnly Cookie
- B. Access Token을 HttpOnly Cookie에 저장
- C. Access Token + Refresh Token을 HttpOnly Cookie에 저장

선택: A.

이유:

- 2주 MVP와 단일 웹서비스에는 Refresh Token 회전/재발급 구조가 과하다.
- 프론트엔드는 Google Access Token, Client Secret, JWT를 직접 다루지 않는다.
- 인증 상태는 서버 세션과 HttpOnly `JSESSIONID` Cookie로 유지한다.
- Google OAuth `state` 검증은 Spring Security OAuth2 Client가 담당한다.

프론트엔드는 토큰을 `localStorage`에 저장하지 않는다.

## 공통 오류 응답

성공 응답은 모든 API에서 강제 Wrapper를 사용하지 않는다. REST 리소스 성격에 맞게 객체, 배열, `204 No Content`를 사용할 수 있다.

오류 응답은 공통 구조를 사용한다.

```json
{
  "timestamp": "2026-08-02T00:00:00Z",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "입력값을 확인해주세요.",
  "fieldErrors": {
    "email": "올바른 이메일 형식이 아닙니다."
  },
  "path": "/api/example",
  "requestId": "optional-request-id"
}
```

`requestId`는 요청 헤더 `X-Request-Id`가 제공될 때만 내려간다.

## 오류 코드 원칙

| HTTP Status | code | 의미 |
|---|---|---|
| 400 | `BAD_REQUEST` | 잘못된 요청 |
| 400 | `VALIDATION_ERROR` | Bean Validation 실패 |
| 401 | `UNAUTHORIZED` | 인증 필요 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 데이터 없음 |
| 409 | `CONFLICT` | 상태 충돌 |
| 409 | `DUPLICATE_RESOURCE` | 중복 데이터 |
| 400 | `FILE_ERROR` | 파일 처리 오류 |
| 500 | `INTERNAL_SERVER_ERROR` | 내부 서버 오류 |

서버 Stack Trace, SQL, DB 구조, 내부 클래스명은 응답에 포함하지 않는다.

## 날짜 형식

- DB 저장 기준 시간대는 UTC를 권장한다.
- 생성/수정 시각, 일정 시작/종료 시각처럼 정확한 시점이 필요한 값은 `Instant`를 우선 사용한다.
- 취득일, 만료일처럼 날짜만 필요한 값은 `LocalDate`를 사용한다.
- 한국 시간 표시는 클라이언트 또는 응답 변환 계층에서 `Asia/Seoul` 기준으로 처리한다.
- JSON 날짜/시간은 ISO-8601 문자열을 사용한다.

## 사용자 소유 데이터 원칙

- 지원 건, 자소서, 자격증, 파일, 외부 링크, 일정은 인증된 사용자 내부 ID 기준으로 조회한다.
- 클라이언트에서 전달한 사용자 ID만 신뢰하지 않는다.
- 목록/상세/수정/삭제는 항상 소유자 범위를 조건에 포함한다.
- 다른 사용자 데이터에 접근하면 `404` 또는 `403` 중 API 정책에 맞는 응답을 사용한다.

## Health Check

```http
GET /api/health
```

응답:

```json
{
  "status": "UP"
}
```

인증 없이 접근 가능하다.

## Auth API

### Google OAuth 시작

```http
GET /oauth2/authorization/google
```

Spring Security가 Google 인증 페이지로 Redirect한다.

### Google OAuth Callback

```http
GET /login/oauth2/code/google
```

Spring Security가 Authorization Code를 처리한다. 프론트엔드는 Authorization Code나 Google Access Token을 직접 처리하지 않는다.

### 현재 사용자 조회

```http
GET /api/auth/me
```

인증 필요.

응답:

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "사용자",
  "profileImageUrl": null,
  "provider": "GOOGLE"
}
```

### 로그아웃

```http
POST /api/auth/logout
```

인증 필요. 세션을 무효화하고 `204 No Content`를 반환한다.

## OAuth Redirect

성공:

```text
{FRONTEND_URL}/dashboard
```

실패:

```text
{FRONTEND_URL}/login?error=oauth_failed
```

내부 오류 내용, Authorization Code, Access Token, Refresh Token은 Redirect URL에 포함하지 않는다.

## Application API

Company는 MVP에서 사용자별 데이터로 관리한다.

이유:

- 회사별 메모와 링크는 개인 취업 준비 맥락을 포함할 수 있다.
- 전역 Company 공유는 중복 병합, 표준 회사명, 권한 정책이 필요해 MVP 범위를 넘는다.
- 한 사용자는 같은 Company 아래 여러 Application을 만들 수 있다.

### 상태 Enum

| API Enum | 프론트 표시 |
|---|---|
| `INTERESTED` | 관심 |
| `WRITING` | 작성중 |
| `SUBMITTED` | 지원완료 |
| `DOCUMENT_RESULT` | 서류 |
| `TEST` | 필기 |
| `INTERVIEW` | 면접 |
| `FINAL_ACCEPTED` | 최종합격 |
| `FINAL_REJECTED` | 불합격 |

### 채용 시기 Enum

| API Enum | 프론트 표시 |
|---|---|
| `FIRST_HALF` | 상반기 |
| `SECOND_HALF` | 하반기 |
| `ROLLING` | 수시 |

### 목록 조회

```http
GET /api/applications
```

Query:

- `status`
- `company`
- `position`
- `recruitmentYear`
- `season`
- `keyword`
- `deadlineFrom`
- `deadlineTo`

초기 응답은 페이지네이션 없이 배열이다. 기본 정렬은 마감일 오름차순이며 마감일이 없는 항목은 뒤로 보낸다.

### 등록

```http
POST /api/applications
```

요청:

```json
{
  "companyName": "KB국민은행",
  "companyHomepageUrl": "https://example.com",
  "companyMemo": "금융권 관심 회사",
  "positionName": "IT 개발",
  "recruitmentTitle": "2026 하반기 IT 개발",
  "recruitmentYear": 2026,
  "season": "SECOND_HALF",
  "postingUrl": "https://example.com/jobs",
  "applicationStartAt": "2026-08-01T00:00:00Z",
  "deadlineAt": "2026-08-10T00:00:00Z",
  "status": "WRITING",
  "workLocation": "서울",
  "applicationSiteUrl": "https://example.com/apply",
  "memo": "자소서 작성 필요"
}
```

동일 사용자의 동일 회사명이 이미 있으면 기존 Company를 재사용한다.

### 상세 조회

```http
GET /api/applications/{id}
```

응답:

```json
{
  "id": 1,
  "companyId": 1,
  "companyName": "KB국민은행",
  "companyHomepageUrl": "https://example.com",
  "positionName": "IT 개발",
  "recruitmentTitle": "2026 하반기 IT 개발",
  "recruitmentYear": 2026,
  "season": "SECOND_HALF",
  "postingUrl": "https://example.com/jobs",
  "applicationStartAt": "2026-08-01T00:00:00Z",
  "deadlineAt": "2026-08-10T00:00:00Z",
  "status": "WRITING",
  "workLocation": "서울",
  "applicationSiteUrl": "https://example.com/apply",
  "memo": "자소서 작성 필요",
  "submittedAt": null,
  "createdAt": "2026-08-02T00:00:00Z",
  "updatedAt": "2026-08-02T00:00:00Z",
  "statusHistories": []
}
```

### 수정

```http
PATCH /api/applications/{id}
```

상태 변경은 별도 endpoint를 사용한다.

### 상태 변경

```http
PATCH /api/applications/{id}/status
```

요청:

```json
{
  "status": "SUBMITTED"
}
```

현재 상태와 다를 때만 `ApplicationStatusHistory`를 생성한다.

### 삭제

```http
DELETE /api/applications/{id}
```

응답:

```http
204 No Content
```

모든 조회·수정·삭제는 인증된 사용자 ID 조건을 포함한다. 다른 사용자 데이터는 `404 NOT_FOUND`로 응답한다.

## Essay API

검색 구현은 JPA Specification을 사용한다. 현재 필터 조합은 단순 join 조건으로 충분해서 QueryDSL은 추가하지 않는다.

### 공통 질문 유형

- `MOTIVATION`
- `GROWTH`
- `PROBLEM_SOLVING`
- `COLLABORATION`
- `CHALLENGE_FAILURE`
- `JOB_COMPETENCY`
- `FUTURE_PLAN`
- `ETHICS_RESPONSIBILITY`
- `OTHER`

### 답변 상태

- `DRAFT`: 작성본, 수정 가능
- `SUBMITTED`: 제출본, 수정 불가
- `IMPROVED`: 제출 이후 개선본, 수정 가능

### 버전 규칙

- 버전 번호는 문항 단위로 증가한다.
- 답변 생성 시 다음 버전 번호를 서버가 계산한다.
- 제출본은 `submit-lock` 이후 수정할 수 없다.
- 제출본 이후 수정은 `POST /api/essay-answers/{id}/versions`로 새 개선본을 만든다.
- 글자 수는 서버가 `content.length()`로 계산한다. 프론트의 `characterCount`는 신뢰하지 않는다.
- 제출 잠금은 `EssayAnswer.lockVersion` optimistic lock 기반으로 동시 제출 충돌을 감지할 수 있게 설계한다.

### 자소서 목록 검색

```http
GET /api/essays
```

Query:

- `company`
- `position`
- `commonType`
- `experienceTag`
- `answerStatus`
- `recruitmentYear`
- `keyword`

예:

```http
GET /api/essays?company=은행&position=IT&commonType=PROBLEM_SOLVING&experienceTag=1&answerStatus=SUBMITTED
```

### 문항

```http
POST /api/applications/{applicationId}/essay-questions
GET /api/applications/{applicationId}/essay-questions
PATCH /api/essay-questions/{id}
```

요청:

```json
{
  "questionOrder": 1,
  "questionText": "지원동기를 작성하세요.",
  "characterLimit": 700,
  "commonQuestionType": "MOTIVATION"
}
```

### 답변

```http
POST /api/essay-questions/{questionId}/answers
PATCH /api/essay-answers/{id}
POST /api/essay-answers/{id}/versions
POST /api/essay-answers/{id}/submit-lock
GET /api/essay-answers/{id}/versions
```

요청:

```json
{
  "content": "답변 내용"
}
```

응답:

```json
{
  "id": 1,
  "questionId": 1,
  "applicationId": 1,
  "companyName": "KB국민은행",
  "positionName": "IT 개발",
  "questionText": "지원동기를 작성하세요.",
  "content": "답변 내용",
  "characterCount": 5,
  "version": 1,
  "status": "DRAFT",
  "submittedAt": null,
  "createdAt": "2026-08-02T00:00:00Z",
  "updatedAt": "2026-08-02T00:00:00Z",
  "experienceTags": []
}
```

### 경험 태그

```http
GET /api/experience-tags
POST /api/experience-tags
POST /api/essay-answers/{id}/tags
DELETE /api/essay-answers/{id}/tags/{tagId}
```

태그 생성 요청:

```json
{
  "name": "LOODI",
  "description": "프로젝트 경험"
}
```

태그 연결 요청:

```json
{
  "tagId": 1
}
```

답변과 태그는 모두 현재 사용자 소유인지 확인한 뒤 연결한다.

## File API

S3 presigned URL은 사용하지 않는다. 업로드와 다운로드 모두 백엔드를 거친다. 저장소 구현은 `FileStorage` 하나이며 현재는 로컬 디스크다.

### 분류

- `PROFILE_PHOTO`
- `TRANSCRIPT`
- `GRADUATION_CERTIFICATE`
- `CREDENTIAL_PROOF`
- `CAREER_CERTIFICATE`
- `PORTFOLIO`
- `OTHER`

### 업로드

```http
POST /api/files
Content-Type: multipart/form-data
```

Form 필드:

| 필드 | 필수 | 설명 |
|---|---|---|
| `file` | O | 파일 본문 |
| `category` | O | 위 분류 값 |
| `displayName` | X | 표시 이름. 없으면 원본 파일명을 쓴다. 150자 이하 |

프론트엔드는 `FormData`를 보낼 때 `Content-Type`을 직접 지정하지 않는다. Boundary는 브라우저가 붙인다.

허용 형식은 차단 목록이 아니라 허용 목록이다. `pdf`, `jpg`, `jpeg`, `png`만 통과하며 확장자와 MIME 타입이 같은 형식을 가리켜야 한다. HTML, SVG, 실행 파일은 모두 거부된다. 한 파일 최대 크기는 `MAX_UPLOAD_SIZE`(기본 10MB)다.

응답 `201`:

```json
{
  "id": 1,
  "category": "CREDENTIAL_PROOF",
  "displayName": "SQLD 자격증",
  "originalFilename": "sqld.pdf",
  "mimeType": "application/pdf",
  "size": 182734,
  "version": 1,
  "parentAssetId": null,
  "downloadUrl": "/api/files/1/download",
  "createdAt": "2026-08-02T00:00:00Z",
  "updatedAt": "2026-08-02T00:00:00Z"
}
```

저장 키는 응답에 포함하지 않는다. 파일 접근은 항상 `id`로만 한다.

### 목록·상세

```http
GET /api/files
GET /api/files?category=PORTFOLIO
GET /api/files/{id}
```

### 다운로드

```http
GET /api/files/{id}/download
```

본인 소유일 때만 본문을 내려준다. 언제나 `Content-Disposition: attachment`이며 공개 URL은 발급하지 않는다. 기록은 있는데 본문이 없으면 `404`다.

### 삭제

```http
DELETE /api/files/{id}
```

응답 `204 No Content`.

자격 정보에 연결된 파일은 `409 CONFLICT`로 거절한다. 연결을 먼저 해제해야 지울 수 있다. 증빙이 조용히 사라지면 무엇을 제출했는지 나중에 확인할 수 없기 때문이다.

### 자격 정보 연결

`POST/PATCH /api/credentials`의 `fileAssetId`로 증빙 파일을 연결한다. 본인이 업로드한 파일만 연결되며, 남의 파일 id는 `404`로 응답한다. `PATCH`는 전체 교체이므로 `fileAssetId`를 빼면 연결이 해제된다.

오류 코드는 형식·크기·본문 문제가 `400 FILE_ERROR`, 남의 파일과 없는 파일이 `404 NOT_FOUND`, 연결된 파일 삭제가 `409 CONFLICT`다.

## Calendar API

Google Calendar 연동은 MVP 2다. 지금은 내부 일정과 알림 규칙만 저장·조회한다. 실제 알림 발송 Scheduler는 이번 단계 범위 밖이며 규칙 저장·조회까지만 구현했다.

### 일정 종류

- `APPLICATION_DEADLINE`
- `APTITUDE_TEST`
- `NCS_TEST`
- `TECHNICAL_TEST`
- `CODING_TEST`
- `AI_ASSESSMENT`
- `ASSIGNMENT`
- `FIRST_INTERVIEW`
- `SECOND_INTERVIEW`
- `FINAL_INTERVIEW`
- `RESULT_ANNOUNCEMENT`
- `PERSONAL_PREPARATION`

### 동기화 상태

- `NOT_CONNECTED`
- `PENDING`
- `SYNCED`
- `FAILED`

Google Calendar 연동 전까지 모든 일정은 `NOT_CONNECTED`로 저장되고 `googleEventId`는 항상 `null`이다.

### 알림 채널과 기본 규칙

`ReminderRule.channel`은 `INTERNAL`, `GOOGLE_CALENDAR`, `EMAIL` 중 하나다.

등록·수정 요청에 `reminderRules`를 아예 보내지 않으면 서버가 기본 알림 4개를 채운다: 7일 전(10080분), 3일 전(4320분), 1일 전(1440분), 당일 3시간 전(180분), 모두 `INTERNAL` 채널·활성 상태. 알림을 전부 끄고 싶으면 빈 배열을 보낸다. `reminderRules`를 보내지 않는 것과 빈 배열을 보내는 것은 다른 요청이다.

같은 일정 안에서 `(minutesBefore, channel)` 조합이 중복되면 `409 DUPLICATE_RESOURCE`다.

### 목록 조회

```http
GET /api/calendar/events
```

Query:

| 파라미터 | 설명 |
|---|---|
| `start` | 조회 시작 시각(ISO-8601). 이 시각 이후 끝나는 일정부터 포함 |
| `end` | 조회 종료 시각. 이 시각 이전 시작하는 일정까지 포함 |
| `upcoming` | `true`면 다가오는 일정 모드. 시작 오름차순 정렬, `start` 미지정 시 현재 시각부터 |
| `limit` | `upcoming=true`일 때만 적용. 기본 10, 최대 100 |
| `applicationId` | 특정 지원 건에 연결된 일정만 |
| `eventType` | 특정 일정 종류만 |

범위 조회는 겹침 기준이다. 여러 날에 걸친 일정은 걸쳐 있는 모든 월에 나온다.

월간 조회 예:

```http
GET /api/calendar/events?start=2026-08-01T00:00:00Z&end=2026-08-31T23:59:59Z
```

다가오는 일정 예:

```http
GET /api/calendar/events?upcoming=true&limit=5
```

### 등록

```http
POST /api/calendar/events
```

요청:

```json
{
  "applicationId": 1,
  "eventType": "FIRST_INTERVIEW",
  "title": "1차 면접",
  "startAt": "2026-09-10T01:00:00Z",
  "endAt": "2026-09-10T02:00:00Z",
  "allDay": false,
  "location": "여의도 본점",
  "onlineUrl": "https://example.com/meet",
  "memo": "포트폴리오 지참",
  "reminderRules": [
    { "minutesBefore": 1440, "channel": "INTERNAL", "enabled": true }
  ]
}
```

`applicationId`를 비우면 개인 일정이다. 응답의 `companyName`·`positionName`은 연결된 지원 건에서 채워지며, 개인 일정은 셋 다 `null`이다.

응답 `201`:

```json
{
  "id": 1,
  "applicationId": 1,
  "companyName": "KB국민은행",
  "positionName": "IT 개발",
  "eventType": "FIRST_INTERVIEW",
  "title": "1차 면접",
  "startAt": "2026-09-10T01:00:00Z",
  "endAt": "2026-09-10T02:00:00Z",
  "allDay": false,
  "location": "여의도 본점",
  "onlineUrl": "https://example.com/meet",
  "memo": "포트폴리오 지참",
  "googleEventId": null,
  "syncStatus": "NOT_CONNECTED",
  "reminderRules": [
    { "id": 1, "minutesBefore": 1440, "channel": "INTERNAL", "enabled": true }
  ],
  "createdAt": "2026-08-02T00:00:00Z",
  "updatedAt": "2026-08-02T00:00:00Z"
}
```

### 상세·수정·삭제

```http
GET /api/calendar/events/{id}
PATCH /api/calendar/events/{id}
DELETE /api/calendar/events/{id}
```

`PATCH`는 등록과 같은 형식의 전체 교체다. `reminderRules`는 매번 통째로 바뀐다. 삭제는 `204 No Content`이며 연결된 알림 규칙도 함께 지워진다.

### Validation

- 제목 필수, 150자 이하.
- 시작 일시 필수.
- 종료 일시는 시작 일시보다 이전일 수 없다. 비우면 시작과 같은 시각으로 채운다.
- 종일 일정(`allDay: true`)은 시작·종료를 보낸 시각과 무관하게 한국 시간 기준 그 날 00:00부터 다음 날 00:00 직전까지로 서버가 재계산한다.
- `onlineUrl`은 `http` 또는 `https` 형식이어야 한다.
- 메모는 1000자 이하.
- `minutesBefore`는 0 이상.
- 같은 일정 안에서 `(minutesBefore, channel)` 중복 금지.
- `applicationId`는 본인 소유 지원 건만 연결 가능. 남의 지원 건이거나 없는 지원 건은 `404`.

### 권한

모든 조회·수정·삭제는 인증된 사용자 ID 조건을 포함한다. 다른 사용자의 일정은 `404`로 응답해 존재 자체를 알리지 않는다. 다른 사용자의 지원 건을 연결하려는 요청도 `404`다.
