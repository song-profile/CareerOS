# CareerDock API Spec

작성일: 2026-08-02
10단계 통합 검증으로 갱신: 2026-08-02

이 문서는 실제 컨트롤러·DTO 코드와 `./gradlew clean test build`(73개 테스트, Testcontainers PostgreSQL)로 검증한 내용만 담는다. 표시된 예시 JSON은 전부 실제 테스트에서 나온 응답을 근거로 한다.

## Base URL

개발 기본값:

```text
http://localhost:8080
```

프론트엔드는 `NEXT_PUBLIC_API_BASE_URL` 환경변수로 백엔드 주소를 설정한다. 이 값이 비어 있으면 프론트 `src/lib/api/env.ts`가 즉시 에러를 던진다(기본값 없음).

## 인증 방식

MVP 기준 인증 방식은 Spring Security Session + HttpOnly Cookie다.

- 인증 상태는 서버 세션과 HttpOnly `JSESSIONID` Cookie로 유지한다.
- Google OAuth `state` 검증은 Spring Security OAuth2 Client가 담당한다.
- 프론트엔드는 Google Access Token, Client Secret, JWT, Authorization Code를 직접 다루지 않는다.
- 프론트엔드는 토큰을 `localStorage`에 저장하지 않는다.
- 아래 "인증 필요" 표시가 있는 모든 endpoint는 세션이 없으면 `401 UNAUTHORIZED`를 반환한다(`RestAuthenticationEntryPoint`).
- `Request Body`나 Query Parameter로 `userId`를 받는 endpoint는 하나도 없다. 소유자는 항상 세션의 `CareerdockOAuth2User` → `LoginUser.id()`에서 가져온다(`CurrentUserAccessor`). 이 부분은 코드 검색으로 확인했다 — `dto` 패키지 어디에도 `userId` 필드가 없다.

## Cookie 설정

`application.yml`:

```yaml
server:
  servlet:
    session:
      cookie:
        http-only: true
        secure: ${COOKIE_SECURE:false}
        same-site: ${COOKIE_SAME_SITE:Lax}
```

로컬 개발은 `secure=false`, `same-site=Lax`(HTTP, 같은 사이트 취급)로 충분하다. 운영에서 프론트와 백엔드가 다른 도메인이면 `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=None`을 HTTPS 아래에서 설정해야 브라우저가 Cross-Site 요청에 쿠키를 실어 보낸다. 프론트는 모든 요청에 `credentials: "include"`를 사용한다(`src/lib/api/client.ts`, `src/lib/api/server-auth.ts` 확인됨).

## CORS 설정

`application.yml` 기본값:

```yaml
app:
  cors:
    allowed-origins: ${ALLOWED_ORIGINS:http://localhost:3000}
    allowed-methods: [GET, POST, PUT, PATCH, DELETE, OPTIONS]
    allowed-headers: [Authorization, Content-Type, Accept, Origin]
    allow-credentials: true
```

전체 허용(`*`)이 아니라 `ALLOWED_ORIGINS`로 지정한 origin만 허용한다(`CorsConfig`/`CorsProperties`, `/**` 경로 전체에 적용). `allow-credentials: true`이므로 브라우저가 쿠키를 포함한 Cross-Origin 요청을 보낼 수 있다. 운영 배포 시 `ALLOWED_ORIGINS`를 실제 프론트 도메인으로 바꿔야 한다.

참고(경고 아님): 오류 응답의 `requestId`는 요청 헤더 `X-Request-Id`를 클라이언트가 보낼 때만 채워진다. 현재 프론트 `errors.ts`는 이 헤더를 보내지 않고, 응답에서 읽기만 시도한다. `CorsConfiguration`에 `exposedHeaders`가 설정돼 있지 않아 Cross-Origin 상황에서는 어차피 `X-Request-Id` 응답 헤더를 JS가 읽을 수 없다. 지금은 요청 자체가 이 헤더를 안 보내므로 실질적인 영향은 없다 — `requestId` 기능을 프론트에서 실제로 쓰게 될 때 함께 손볼 항목으로 남겨 둔다.

## Multipart 공통 규칙

파일 업로드(`POST /api/files`)만 `multipart/form-data`를 쓴다. 그 외 모든 endpoint는 `application/json`이다.

- 프론트는 `FormData`를 보낼 때 `Content-Type`을 직접 지정하지 않는다. Boundary는 브라우저가 붙인다(`fetch` 기본 동작, `src/lib/api/client.ts`가 body가 `FormData`면 `Content-Type`을 세팅하지 않음을 확인함).
- 서버 쪽 필드명은 `file`(본문), `category`(필수), `displayName`(선택)이다. 프론트 `file-api.ts`가 기대하는 필드명과 일치한다.
- 한 파일 최대 크기는 `MAX_UPLOAD_SIZE`(기본 10MB), 요청 전체 한도는 `MAX_UPLOAD_REQUEST_SIZE`(기본 11MB, 폼 필드 여유분). 초과 시 `400 FILE_ERROR`(`MaxUploadSizeExceededException`을 `GlobalExceptionHandler`가 변환).
- 허용 형식은 차단 목록이 아니라 허용 목록이다: `pdf`, `jpg`, `jpeg`, `png`. 확장자와 MIME 타입이 같은 형식을 가리켜야 통과한다. HTML, SVG, 실행 파일은 모두 거부된다.

## 공통 오류 응답

성공 응답은 모든 API에서 강제 Wrapper를 사용하지 않는다. REST 리소스 성격에 맞게 객체, 배열, `204 No Content`를 사용한다.

오류 응답은 공통 구조를 사용한다(`ErrorResponse`):

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
  "requestId": null
}
```

`requestId`는 요청 헤더 `X-Request-Id`가 제공될 때만 값이 들어가고, 아니면 `null`이다(생략되지 않고 키는 항상 존재). `fieldErrors`는 Bean Validation 실패가 아니면 빈 객체 `{}`다.

## 오류 코드 원칙

| HTTP Status | code | 의미 |
|---|---|---|
| 400 | `BAD_REQUEST` | 잘못된 요청 |
| 400 | `VALIDATION_ERROR` | Bean Validation 실패 |
| 400 | `FILE_ERROR` | 파일 형식·크기·본문 처리 오류 |
| 401 | `UNAUTHORIZED` | 인증 필요 |
| 403 | `FORBIDDEN` | 권한 없음(현재 실제로 내려주는 endpoint는 없음 — 소유권 위반은 전부 404로 응답) |
| 404 | `NOT_FOUND` | 데이터 없음 또는 다른 사용자 소유 |
| 409 | `CONFLICT` | 상태 충돌(제출본 재수정, 연결된 원본 삭제 시도 등) |
| 409 | `DUPLICATE_RESOURCE` | 중복 데이터(중복 연결, 중복 알림 규칙, 중복 태그 이름) |
| 500 | `INTERNAL_SERVER_ERROR` | 내부 서버 오류 |

서버 Stack Trace, SQL, DB 구조, 내부 클래스명은 응답에 포함하지 않는다(`GlobalExceptionHandler`의 `Exception.class` 핸들러가 항상 고정 메시지만 반환).

## 날짜 형식

- DB 저장 기준 시간대는 UTC다.
- 생성/수정 시각, 일정 시작/종료 시각처럼 정확한 시점이 필요한 값은 `Instant`를 쓴다. JSON은 `2026-08-02T00:00:00Z` 형식(ISO-8601, `Z` 접미사)이다. `JacksonConfig`가 타임스탬프 숫자 직렬화를 껐으므로 항상 문자열이다.
- 취득일, 만료일처럼 날짜만 필요한 값은 `LocalDate`를 쓴다. JSON은 `2024-06-21` 형식이다.
- 한국 시간 표시는 클라이언트가 `Asia/Seoul` 기준으로 변환한다. 예외로 캘린더 종일 일정(`allDay: true`)은 서버가 한국 날짜 하루 경계로 재계산해서 저장한다.
- `null` 필드는 응답에서 생략되지 않고 `"field": null`로 내려간다(Jackson 기본 동작, `@JsonInclude` 미설정 확인됨). 프론트 DTO 타입이 `string | null`로 선언한 필드와 일치한다.

## 사용자 소유 데이터 원칙

- 지원 건, 자소서, 자격증, 파일, 외부 링크, 일정, 지원 건-자료 연결은 모두 인증된 사용자 내부 ID 기준으로 조회한다.
- 클라이언트에서 전달한 사용자 ID는 존재하지 않는다(위 인증 방식 참고).
- 목록/상세/수정/삭제는 항상 소유자 범위를 조건에 포함한다(`findByIdAndUserId` 계열 repository 메서드).
- 다른 사용자 데이터에 접근하면 `404 NOT_FOUND`로 응답한다 — 존재 자체를 알리지 않기 위해 `403`을 쓰지 않는다. 이 정책은 지원 건·자소서·자격증·파일·외부 링크·일정·지원 건 연결 전부에서 일관되게 적용됨을 테스트로 확인했다.

## Enum 전체 목록

아래 9개는 프론트·백엔드 값이 1:1로 검증됐다(자세한 내용은 "프론트-백엔드 타입 비교표" 참고).

| Enum | 값 |
|---|---|
| `ApplicationStatus` | `INTERESTED` `WRITING` `SUBMITTED` `DOCUMENT_RESULT` `TEST` `INTERVIEW` `FINAL_ACCEPTED` `FINAL_REJECTED` |
| `RecruitmentSeason` | `FIRST_HALF` `SECOND_HALF` `ROLLING` |
| `EssayAnswerStatus` | `DRAFT` `SUBMITTED` `IMPROVED` |
| `CommonQuestionType` | `MOTIVATION` `GROWTH` `PROBLEM_SOLVING` `COLLABORATION` `CHALLENGE_FAILURE` `JOB_COMPETENCY` `FUTURE_PLAN` `ETHICS_RESPONSIBILITY` `OTHER` |
| `CredentialType` | `CERTIFICATION` `LANGUAGE` `AWARD` `EDUCATION_DOCUMENT` `OTHER` |
| `LinkType` | `GITHUB` `NOTION` `BLOG` `VELOG` `PORTFOLIO` `LINKEDIN` `DEPLOYED_SERVICE` `PROJECT_REPOSITORY` `OTHER` |
| `LinkVisibility` | `PRIVATE` `PUBLIC` |
| `FileCategory` | `PROFILE_PHOTO` `TRANSCRIPT` `GRADUATION_CERTIFICATE` `CREDENTIAL_PROOF` `CAREER_CERTIFICATE` `PORTFOLIO` `OTHER` |
| `EventType`(캘린더) | `APPLICATION_DEADLINE` `APTITUDE_TEST` `NCS_TEST` `TECHNICAL_TEST` `CODING_TEST` `AI_ASSESSMENT` `ASSIGNMENT` `FIRST_INTERVIEW` `SECOND_INTERVIEW` `FINAL_INTERVIEW` `RESULT_ANNOUNCEMENT` `PERSONAL_PREPARATION` |
| `SyncStatus`(캘린더) | `NOT_CONNECTED` `PENDING` `SYNCED` `FAILED` |
| `ReminderChannel`(캘린더) | `INTERNAL` `GOOGLE_CALENDAR` `EMAIL` |

`LinkType`과 `FileCategory`는 백엔드/DTO 레벨에서는 프론트와 값 개수까지 정확히 일치한다. 다만 프론트의 화면용 view-model 타입(`ExternalLinkType`은 7개, `MaterialFileType`은 6개)은 이 중 일부 값(`DEPLOYED_SERVICE`, `PROJECT_REPOSITORY`, `CAREER_CERTIFICATE`)을 아직 화면에서 선택할 수 없다 — 백엔드 DTO 문제가 아니라 프론트 view-model이 아직 다 따라가지 못한 것이다. 자세한 내용은 비교표 참고.

---

# Endpoint 목록

## Health API

### 헬스체크

- `GET /api/health`
- 인증: 불필요
- 성공: `200`
- 예시 응답:

```json
{ "status": "UP" }
```

## Auth API

### Google OAuth 시작

- `GET /oauth2/authorization/google`
- 인증: 불필요
- Spring Security가 Google 인증 페이지로 302 Redirect한다. 프론트는 이 URL로 브라우저를 이동시키기만 하면 된다(`window.location.href`).

### Google OAuth Callback

- `GET /login/oauth2/code/google`
- 인증: 불필요(Google이 호출)
- Spring Security OAuth2 Client가 Authorization Code 교환과 `state` 검증을 처리한다. 프론트는 이 URL을 직접 호출하지 않는다.
- 성공 시 `302` → `{FRONTEND_URL}/dashboard`, 실패 시 `302` → `{FRONTEND_URL}/login?error=oauth_failed` (아래 "OAuth Redirect" 참고).

### 현재 사용자 조회

- `GET /api/auth/me`
- 인증: 필요
- 성공: `200`
- 오류: `401 UNAUTHORIZED`(세션 없음)
- 예시 응답:

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

- `POST /api/auth/logout`
- 인증: 필요
- 성공: `204 No Content` — 세션을 무효화하고 `JSESSIONID` 쿠키를 지운다.
- 오류: `401 UNAUTHORIZED`

## OAuth Redirect

성공:

```text
{FRONTEND_URL}/dashboard
```

실패:

```text
{FRONTEND_URL}/login?error=oauth_failed
```

내부 오류 내용, Authorization Code, Access Token, Refresh Token은 Redirect URL 어디에도 포함하지 않는다(`OAuth2AuthenticationSuccessHandler`/`FailureHandler` 코드로 확인).

## Application API

Company는 MVP에서 사용자별 데이터로 관리한다(전역 공유 아님). 한 사용자는 같은 Company 아래 여러 Application을 만들 수 있다.

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

- `GET /api/applications`
- 인증: 필요
- Query(전부 선택): `status`, `company`, `position`, `recruitmentYear`, `season`, `keyword`, `deadlineFrom`, `deadlineTo`
- 성공: `200`, `ApplicationResponse[]`(페이지네이션 없음). 기본 정렬은 마감일 오름차순, 마감일이 없는 항목은 뒤로 보낸다.

### 등록

- `POST /api/applications`
- 인증: 필요
- 성공: `201`
- 오류: `400 VALIDATION_ERROR`
- Validation: `companyName`/`positionName` 필수·150자 이하, `recruitmentYear` 2000~2100, `season` 필수, `companyHomepageUrl`/`postingUrl`/`applicationSiteUrl`은 URL 형식, `deadlineAt`은 `applicationStartAt`보다 이전일 수 없음, `memo` 500자 이하.
- 동일 사용자의 동일 회사명이 이미 있으면 기존 Company를 재사용한다.

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

응답(등록·상세 공통):

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

### 상세 조회

- `GET /api/applications/{id}`
- 인증: 필요
- 성공: `200`, 응답 형식은 위와 동일하고 `statusHistories`에 `{id, previousStatus, newStatus, changedAt}` 배열이 채워진다.
- 오류: `404 NOT_FOUND`(없음 또는 타인 소유)

### 수정

- `PATCH /api/applications/{id}`
- 인증: 필요
- 성공: `200`
- 오류: `400 VALIDATION_ERROR`, `404 NOT_FOUND`
- 등록과 같은 Validation. `status` 필드는 받지 않는다(상태 변경은 별도 endpoint).

### 상태 변경

- `PATCH /api/applications/{id}/status`
- 인증: 필요
- 성공: `200`
- 오류: `400 VALIDATION_ERROR`(status 없음), `404 NOT_FOUND`
- 현재 상태와 다를 때만 `ApplicationStatusHistory`를 생성한다. 같은 상태로 다시 보내면 기록을 남기지 않는다.

요청:

```json
{ "status": "SUBMITTED" }
```

### 삭제

- `DELETE /api/applications/{id}`
- 인증: 필요
- 성공: `204 No Content`
- 오류: `404 NOT_FOUND`
- 연쇄 삭제: `essay_questions`, `recruitment_events`(캘린더 일정), `application_files`/`application_credentials`/`application_external_links`(연결 행) 모두 `ON DELETE CASCADE`. 파일·자격·외부 링크 원본은 영향받지 않는다.

## Essay API

검색은 JPA Specification을 쓴다(필터 조합이 단순해서 QueryDSL 미도입).

### 공통 질문 유형

`MOTIVATION` `GROWTH` `PROBLEM_SOLVING` `COLLABORATION` `CHALLENGE_FAILURE` `JOB_COMPETENCY` `FUTURE_PLAN` `ETHICS_RESPONSIBILITY` `OTHER`

### 답변 상태

- `DRAFT`: 작성본, 수정 가능
- `SUBMITTED`: 제출본, 수정 불가
- `IMPROVED`: 제출 이후 개선본, 수정 가능

### 버전·제출 잠금 규칙

- 버전 번호는 문항 단위로 증가한다. 답변 생성 시 서버가 다음 버전 번호를 계산한다(`findMaxVersionByQuestionId + 1`).
- 글자 수는 서버가 `content.length()`로 계산한다. 프론트가 보낸 `characterCount`는 무시한다(애초에 요청 DTO에 그 필드가 없음).
- 제출본(`SUBMITTED`)은 수정 요청 시 `409 CONFLICT`. 제출 이후 수정하려면 `POST /api/essay-answers/{id}/versions`로 새 개선본(`IMPROVED`, 버전 +1)을 만든다.
- `submit-lock` 이후 같은 답변에 다시 `submit-lock`을 호출하면 `409 CONFLICT`.

### 자소서 목록 검색

- `GET /api/essays`
- 인증: 필요
- Query(전부 선택): `company`, `position`, `commonType`, `experienceTag`, `answerStatus`, `recruitmentYear`, `keyword`
- 성공: `200`, `EssayAnswerResponse[]`, 최근 수정순 정렬
- 예시: `GET /api/essays?company=은행&position=IT&commonType=PROBLEM_SOLVING&experienceTag=1&answerStatus=SUBMITTED`

### 문항 등록

- `POST /api/applications/{applicationId}/essay-questions`
- 인증: 필요
- 성공: `201`
- 오류: `400 VALIDATION_ERROR`, `404 NOT_FOUND`(지원 건 없음/타인 소유)
- Validation: `questionOrder` 1 이상, `questionText` 필수·2000자 이하, `characterLimit` 1~10000(선택), `commonQuestionType` 필수.
- **발견한 문제**: 같은 지원 건 안에서 `questionOrder`가 중복되면 DB 유니크 제약(`uk_essay_questions_application_order`)에 걸리는데, `EssayService.createQuestion`은 저장 전에 이를 미리 확인하지 않고, `GlobalExceptionHandler`에도 `DataIntegrityViolationException` 핸들러가 없다. 그래서 이 경우 `409`가 아니라 **`500 INTERNAL_SERVER_ERROR`**로 응답한다(내부 오류 메시지는 노출 안 되지만 사용자에게 원인을 알려주지 못함). 자소서·지원 건 다른 모든 중복 검증은 서비스 레벨에서 먼저 `DuplicateResourceException`으로 막아 `409`를 주는 것과 다른 경로다. "새로운 기능을 추가하지 않는다"는 이번 단계 범위라 고치지 않았고, 다음 백엔드 작업으로 남긴다.

요청:

```json
{
  "questionOrder": 1,
  "questionText": "지원동기를 작성하세요.",
  "characterLimit": 700,
  "commonQuestionType": "MOTIVATION"
}
```

응답:

```json
{
  "id": 1,
  "applicationId": 1,
  "questionOrder": 1,
  "questionText": "지원동기를 작성하세요.",
  "characterLimit": 700,
  "commonQuestionType": "MOTIVATION"
}
```

### 문항 목록·수정

- `GET /api/applications/{applicationId}/essay-questions` — 인증 필요, 성공 `200`, 오류 `404`(지원 건 없음/타인 소유)
- `PATCH /api/essay-questions/{id}` — 인증 필요, 성공 `200`, 오류 `400 VALIDATION_ERROR`/`404 NOT_FOUND`. 요청 형식은 등록과 동일.

### 답변 생성

- `POST /api/essay-questions/{questionId}/answers`
- 인증: 필요
- 성공: `201`
- 오류: `400 VALIDATION_ERROR`(content 20000자 초과 등), `404 NOT_FOUND`(문항 없음/타인 소유)

요청:

```json
{ "content": "답변 내용" }
```

응답(답변 관련 모든 endpoint 공통 형식):

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

주의: 이 응답에는 `commonQuestionType`도 `season`도 없다(문항·지원 건 조인이 필요). 프론트가 화면에 그 값을 쓰려면 `EssayQuestionResponse`(문항 API)를 별도로 조회해 합쳐야 한다 — 프론트 `essay-api.ts`의 주석도 같은 이유로 화면 연결을 보류 중이라고 적혀 있다.

### 답변 수정·개선본·제출 잠금·버전 목록

- `PATCH /api/essay-answers/{id}` — 인증 필요. 성공 `200`. 오류 `409 CONFLICT`(제출본), `404 NOT_FOUND`. 요청 `{"content": "..."}`.
- `POST /api/essay-answers/{id}/versions` — 인증 필요. 성공 `201`(`IMPROVED`, 버전 +1). 오류 `404 NOT_FOUND`. 요청 `{"content": "..."}`.
- `POST /api/essay-answers/{id}/submit-lock` — 인증 필요. 성공 `200`(`status: SUBMITTED`, `submittedAt` 채워짐). 오류 `409 CONFLICT`(이미 제출됨), `404 NOT_FOUND`. 요청 `{"content": "..."}`.
- `GET /api/essay-answers/{id}/versions` — 인증 필요. 성공 `200`, 같은 문항의 모든 버전을 버전 내림차순으로 반환. 오류 `404 NOT_FOUND`.

### 경험 태그

- `GET /api/experience-tags` — 인증 필요. 성공 `200`, `{id, name, description}[]`.
- `POST /api/experience-tags` — 인증 필요. 성공 `201`. 오류 `400 VALIDATION_ERROR`(name 필수·100자 이하), `409 DUPLICATE_RESOURCE`(같은 이름 태그 이미 있음).
- `POST /api/essay-answers/{id}/tags` — 인증 필요. 성공 `200`(답변 응답 반환, `experienceTags`에 추가됨). 오류 `404 NOT_FOUND`(답변 또는 태그 없음/타인 소유). 이미 연결된 태그를 다시 연결해도 에러 없이 그대로 반환(멱등).
- `DELETE /api/essay-answers/{id}/tags/{tagId}` — 인증 필요. 성공 `204`. 오류 `404 NOT_FOUND`.

태그 생성 요청: `{"name": "LOODI", "description": "프로젝트 경험"}`
태그 연결 요청: `{"tagId": 1}`

답변과 태그는 모두 현재 사용자 소유인지 확인한 뒤 연결한다.

## Credential API

자격증·어학 점수를 다룬다. 자격번호는 AES-256-GCM으로 암호화해 저장하고, 목록·상세 응답에는 마스킹된 값만 나간다.

### 마스킹 규칙

앞 4자만 남기고 나머지를 `*`로 채운다(2자 이하면 전부 마스킹). 예: `SQLD-2025-000123`(16자) → `SQLD************`(4자 + `*` 12개).

### 목록 조회

- `GET /api/credentials`
- 인증: 필요
- Query(선택): `type`(`CredentialType`), `expiringInDays`(정수 — 이 일수 안에 만료되는 것만, 영구 자격은 항상 제외)
- 성공: `200`, `CredentialResponse[]`, 취득일 내림차순

### 등록

- `POST /api/credentials`
- 인증: 필요
- 성공: `201`
- 오류: `400 VALIDATION_ERROR`, `404 NOT_FOUND`(`fileAssetId`가 본인 소유가 아니거나 없음)
- Validation: `credentialType`/`acquiredAt` 필수, `acquiredAt`은 오늘 이전이어야 함(`@PastOrPresent`), `name` 필수·150자 이하, `permanent=true`면 `expiresAt`을 함께 보낼 수 없음, `validFrom`/`expiresAt`은 `acquiredAt` 이후, `expiresAt`은 `validFrom` 이후, `referenceUrl`은 http/https 형식.

요청:

```json
{
  "credentialType": "CERTIFICATION",
  "name": "SQLD",
  "issuer": "한국데이터산업진흥원",
  "acquiredAt": "2025-06-21",
  "credentialNumber": "SQLD-2025-000123",
  "score": null,
  "grade": null,
  "validFrom": null,
  "expiresAt": null,
  "permanent": true,
  "description": null,
  "usageMemo": null,
  "studyMemo": null,
  "referenceUrl": null,
  "fileAssetId": null
}
```

응답(등록·목록·상세 공통):

```json
{
  "id": 1,
  "credentialType": "CERTIFICATION",
  "name": "SQLD",
  "issuer": "한국데이터산업진흥원",
  "acquiredAt": "2025-06-21",
  "credentialNumberMasked": "SQLD************",
  "hasCredentialNumber": true,
  "score": null,
  "grade": null,
  "validFrom": null,
  "expiresAt": null,
  "permanent": true,
  "description": null,
  "usageMemo": null,
  "studyMemo": null,
  "referenceUrl": null,
  "fileAssetId": null,
  "createdAt": "2026-08-02T00:00:00Z",
  "updatedAt": "2026-08-02T00:00:00Z"
}
```

응답에는 평문 `credentialNumber` 필드가 아예 없다(직렬화 대상에서 제외).

### 상세·수정·삭제

- `GET /api/credentials/{id}` — 인증 필요. 성공 `200`. 오류 `404 NOT_FOUND`.
- `PATCH /api/credentials/{id}` — 인증 필요. 성공 `200`. 오류 `400`/`404`. **전체 교체 방식**이다 — `fileAssetId`를 빼고 보내면 파일 연결이 해제된다. 등록과 같은 Validation.
- `DELETE /api/credentials/{id}` — 인증 필요. 성공 `204`. 오류 `404 NOT_FOUND`, **`409 CONFLICT`**(지원 건에 연결된 자격이면 거절 — 연결을 먼저 해제해야 함, 9단계에서 추가).

### 자격번호 전체 조회

- `GET /api/credentials/{id}/number`
- 인증: 필요
- 성공: `200`
- 오류: `404 NOT_FOUND`(자격 없음/타인 소유, 또는 등록된 번호 없음)
- 본인 소유일 때만 복호화하고, 조회할 때마다 `credential_access_audits`에 감사 기록을 남긴다(응답에는 노출 안 됨).

응답:

```json
{ "credentialId": 1, "credentialNumber": "SQLD-2025-000123" }
```

## External Link API

GitHub, Notion, 포트폴리오 등 외부 링크를 관리한다. URL은 `http`/`https`만 허용해 `javascript:` 스킴을 차단한다.

### 목록 조회

- `GET /api/external-links`
- 인증: 필요
- Query: 없음(전체 목록만 반환, 필터 없음)
- 성공: `200`, `ExternalLinkResponse[]`, 생성일 내림차순
- 상세 조회 endpoint는 없다(`GET /api/external-links/{id}` 미구현) — 프론트가 상세가 필요하면 목록에서 걸러야 한다.

### 등록

- `POST /api/external-links`
- 인증: 필요
- 성공: `201`
- 오류: `400 VALIDATION_ERROR`
- Validation: `linkType` 필수, `displayName` 필수·150자 이하, `url` 필수·1000자 이하·`^https?://\S+$`, `description` 300자 이하, `projectName` 150자 이하. `visibility`를 비우면 `PRIVATE`.

요청:

```json
{
  "linkType": "GITHUB",
  "displayName": "내 깃허브",
  "url": "https://github.com/example",
  "description": "사이드 프로젝트 저장소",
  "visibility": "PRIVATE",
  "projectName": "CareerDock"
}
```

응답(등록·목록 공통):

```json
{
  "id": 1,
  "linkType": "GITHUB",
  "displayName": "내 깃허브",
  "url": "https://github.com/example",
  "description": "사이드 프로젝트 저장소",
  "visibility": "PRIVATE",
  "projectName": "CareerDock",
  "createdAt": "2026-08-02T00:00:00Z",
  "updatedAt": "2026-08-02T00:00:00Z"
}
```

### 수정·삭제

- `PATCH /api/external-links/{id}` — 인증 필요. 성공 `200`. 오류 `400`/`404`. 전체 교체 방식, 등록과 같은 Validation.
- `DELETE /api/external-links/{id}` — 인증 필요. 성공 `204`. 오류 `404 NOT_FOUND`, **`409 CONFLICT`**(지원 건에 연결된 링크면 거절, 9단계에서 추가).

## File API

S3 presigned URL은 쓰지 않는다. 업로드·다운로드 모두 백엔드를 거친다. 저장소 구현은 `FileStorage` 인터페이스 하나뿐이고 현재는 로컬 디스크다.

### 분류

`PROFILE_PHOTO` `TRANSCRIPT` `GRADUATION_CERTIFICATE` `CREDENTIAL_PROOF` `CAREER_CERTIFICATE` `PORTFOLIO` `OTHER`

### 업로드

- `POST /api/files` (`multipart/form-data`, Multipart 공통 규칙 참고)
- 인증: 필요
- 성공: `201`
- 오류: `400 FILE_ERROR`(형식·크기·빈 파일), `400 VALIDATION_ERROR`(category 없음)

응답:

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

저장 키(`storageKey`)는 응답에 없다. 파일 접근은 항상 `id`로만 한다.

### 목록·상세

- `GET /api/files` — 인증 필요. Query(선택): `category`. 성공 `200`.
- `GET /api/files/{id}` — 인증 필요. 성공 `200`. 오류 `404 NOT_FOUND`.

### 다운로드

- `GET /api/files/{id}/download`
- 인증: 필요
- 성공: `200`, `Content-Disposition: attachment`(항상 첨부 다운로드, 브라우저에서 바로 열리지 않음), `Content-Type`은 저장된 MIME 타입
- 오류: `404 NOT_FOUND`(파일 없음/타인 소유, 또는 DB 기록은 있는데 저장소 본문이 없는 경우)

### 삭제

- `DELETE /api/files/{id}`
- 인증: 필요
- 성공: `204`
- 오류: `404 NOT_FOUND`, **`409 CONFLICT`**(자격 증빙으로 연결됐거나 지원 건에 연결된 파일 — 두 경우 모두 연결을 먼저 해제해야 함)

## Calendar API

Google Calendar 연동은 MVP 2다. 지금은 내부 일정과 알림 규칙만 저장·조회한다. 실제 알림 발송 Scheduler는 구현하지 않았다(규칙 저장·조회까지만).

### 일정 종류

`APPLICATION_DEADLINE` `APTITUDE_TEST` `NCS_TEST` `TECHNICAL_TEST` `CODING_TEST` `AI_ASSESSMENT` `ASSIGNMENT` `FIRST_INTERVIEW` `SECOND_INTERVIEW` `FINAL_INTERVIEW` `RESULT_ANNOUNCEMENT` `PERSONAL_PREPARATION`

### 동기화 상태

`NOT_CONNECTED` `PENDING` `SYNCED` `FAILED` — Google Calendar 연동 전까지 모든 일정은 `NOT_CONNECTED`로 저장되고 `googleEventId`는 항상 `null`이다.

### 알림 채널과 기본 규칙

`ReminderRule.channel`은 `INTERNAL`, `GOOGLE_CALENDAR`, `EMAIL` 중 하나다.

등록·수정 요청에 `reminderRules`를 아예 보내지 않으면 서버가 기본 알림 4개를 채운다: 7일 전(10080분), 3일 전(4320분), 1일 전(1440분), 당일 3시간 전(180분), 모두 `INTERNAL` 채널·활성 상태. 알림을 전부 끄고 싶으면 빈 배열을 보낸다 — `reminderRules`를 아예 안 보내는 것과 빈 배열을 보내는 것은 다른 요청이다.

### 목록 조회(월간·다가오는 일정 공통)

- `GET /api/calendar/events`
- 인증: 필요
- Query(전부 선택):

| 파라미터 | 설명 |
|---|---|
| `start` | 조회 시작 시각(ISO-8601). 이 시각 이후 끝나는 일정부터 포함 |
| `end` | 조회 종료 시각. 이 시각 이전 시작하는 일정까지 포함 |
| `upcoming` | `true`면 다가오는 일정 모드. 시작 오름차순 정렬, `start` 미지정 시 현재 시각부터 |
| `limit` | `upcoming=true`일 때만 적용. 기본 10, 최대 100 |
| `applicationId` | 특정 지원 건에 연결된 일정만 |
| `eventType` | 특정 일정 종류만 |

- 성공: `200`, `RecruitmentEventResponse[]`
- 범위 조회는 겹침 기준이다. 여러 날에 걸친 일정은 걸쳐 있는 모든 범위 조회에 나온다.
- 예시: `GET /api/calendar/events?start=2026-08-01T00:00:00Z&end=2026-08-31T23:59:59Z`, `GET /api/calendar/events?upcoming=true&limit=5`

### 등록

- `POST /api/calendar/events`
- 인증: 필요
- 성공: `201`
- 오류: `400 VALIDATION_ERROR`, `404 NOT_FOUND`(`applicationId`가 타인 소유 또는 없음), `409 DUPLICATE_RESOURCE`(알림 규칙 중복)
- Validation: `title` 필수·150자 이하, `startAt` 필수, `endAt`은 `startAt`보다 이전 불가(비우면 `startAt`과 같은 시각), `onlineUrl`은 http/https, `memo` 1000자 이하, `minutesBefore` 0 이상, 같은 일정 안에서 `(minutesBefore, channel)` 중복 금지, `applicationId`는 본인 소유만.
- 종일 일정(`allDay: true`)은 보낸 시각과 무관하게 한국 시간 기준 그 날 00:00부터 다음 날 00:00 직전까지로 서버가 재계산한다.

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

응답:

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

- `GET /api/calendar/events/{id}` — 인증 필요. 성공 `200`. 오류 `404 NOT_FOUND`.
- `PATCH /api/calendar/events/{id}` — 인증 필요. 성공 `200`. 오류 `400`/`404`/`409`. 등록과 같은 형식의 **전체 교체**. `reminderRules`는 매번 통째로 바뀐다.
- `DELETE /api/calendar/events/{id}` — 인증 필요. 성공 `204`. 오류 `404`. 연결된 알림 규칙도 함께 지워진다(`ON DELETE CASCADE`).

## Application Resources API

지원 건에 실제로 무엇을 제출했는지 나중에도 확인하기 위한 연결 API다. 파일·자격·외부 링크는 별도 연결 테이블(`application_files`, `application_credentials`, `application_external_links`)로 관계를 맺는다.

자소서는 별도 연결 테이블이 없다. `EssayQuestion`이 이미 `application_id`를 직접 가지고 있어(6단계) 문항 자체가 지원 건에 속한다. `essayQuestions`는 그 문항들에 실제 제출본이 있는지를 함께 보여줄 뿐, 새 관계를 만들지 않는다.

연결과 원본 삭제는 다른 동작이다. 연결 해제(`DELETE`)는 연결 행만 지우고 파일·자격·외부 링크 원본은 각자의 API에 그대로 남는다. 반대로 원본이 지원 건에 연결돼 있으면 `DELETE /api/files/{id}`, `DELETE /api/credentials/{id}`, `DELETE /api/external-links/{id}`는 `409 CONFLICT`로 거절된다.

지원 건을 삭제하면 그 지원 건의 연결 행은 함께 지워진다(`ON DELETE CASCADE`). 파일·자격·외부 링크 원본은 영향받지 않는다.

**다중 연결 미지원**: `POST .../files`, `.../credentials`, `.../external-links`는 한 번에 하나씩만 연결한다. 프론트 "제출자료" 섹션이 아직 목업 상태고(`application-detail.tsx`의 `ApplicationMaterialsSection`, `placeholderHref`) 여러 개를 한 번에 고르는 화면이 없어서, 배열 요청(`fileIds: [1,2,3]`) 대신 이 API의 다른 endpoint들과 같은 단일 연결 형태로 맞췄다.

### 통합 조회

- `GET /api/applications/{id}/resources`
- 인증: 필요
- 성공: `200`
- 오류: `404 NOT_FOUND`

```json
{
  "applicationId": 1,
  "files": [
    {
      "id": 10, "fileAssetId": 3, "category": "CREDENTIAL_PROOF",
      "displayName": "SQLD 자격증", "originalFilename": "sqld.pdf",
      "mimeType": "application/pdf", "size": 182734, "lockedVersion": 1,
      "downloadUrl": "/api/files/3/download", "purpose": "자격 증빙",
      "linkedAt": "2026-08-02T00:00:00Z"
    }
  ],
  "credentials": [
    {
      "id": 11, "credentialId": 5, "credentialType": "CERTIFICATION",
      "name": "SQLD", "issuer": "한국데이터산업진흥원", "purpose": null,
      "linkedAt": "2026-08-02T00:00:00Z"
    }
  ],
  "externalLinks": [
    {
      "id": 12, "externalLinkId": 2, "linkType": "GITHUB",
      "displayName": "내 깃허브", "url": "https://github.com/example",
      "purpose": null, "linkedAt": "2026-08-02T00:00:00Z"
    }
  ],
  "essayQuestions": [
    {
      "id": 1, "questionOrder": 1, "questionText": "지원동기를 작성하세요.",
      "commonQuestionType": "MOTIVATION", "hasSubmittedAnswer": true,
      "submittedAnswerId": 7, "submittedAnswerVersion": 1,
      "submittedAt": "2026-08-02T00:00:00Z"
    }
  ]
}
```

`credentials`에는 자격번호(마스킹 값 포함)를 넣지 않는다 — 필요하면 `GET /api/credentials/{id}`를 따로 호출한다. `essayQuestions.hasSubmittedAnswer`가 `false`면 나머지 `submitted*` 필드는 `null`이다.

### 파일 연결·해제

- `POST /api/applications/{id}/files` — 인증 필요. 성공 `201`. 오류 `400 VALIDATION_ERROR`(purpose 100자 초과), `404 NOT_FOUND`(지원 건 또는 파일이 없음/타인 소유), `409 DUPLICATE_RESOURCE`(같은 파일 중복 연결).
- `DELETE /api/applications/{id}/files/{fileId}` — 인증 필요. 성공 `204`. 오류 `404 NOT_FOUND`. `{fileId}`는 `FileAsset`의 id다(연결 행 id가 아님).

요청: `{ "fileAssetId": 3, "purpose": "자격 증빙" }` (`purpose`는 선택, 100자 이하)

### 자격 연결·해제

- `POST /api/applications/{id}/credentials` — 인증 필요. 성공 `201`. 오류 `400`/`404`/`409 DUPLICATE_RESOURCE`.
- `DELETE /api/applications/{id}/credentials/{credentialId}` — 인증 필요. 성공 `204`. 오류 `404`.

요청: `{ "credentialId": 5, "purpose": "자격 증빙" }`

### 외부 링크 연결·해제

- `POST /api/applications/{id}/external-links` — 인증 필요. 성공 `201`. 오류 `400`/`404`/`409 DUPLICATE_RESOURCE`.
- `DELETE /api/applications/{id}/external-links/{linkId}` — 인증 필요. 성공 `204`. 오류 `404`.

요청: `{ "externalLinkId": 2, "purpose": "포트폴리오 링크" }`

### 도메인 규칙

- `Application`은 현재 사용자 소유여야 한다.
- 연결할 파일·자격·외부 링크도 현재 사용자 소유여야 한다.
- 같은 지원 건에 같은 자료를 두 번 연결할 수 없다(`(application_id, 자료 id)` 유니크 제약).
- 다른 사용자의 자료이거나 존재하지 않는 자료를 연결하려 하면 `404`다 — 존재 자체를 알리지 않는다.
- `lockedVersion`은 연결 시점의 파일 버전을 그대로 기록만 한다. 지금은 파일 버전 기능 자체가 없어 항상 1이고, 이 값을 근거로 막거나 잠그는 동작은 없다(가짜 버전 잠금 없음).

---

# 프론트-백엔드 타입 비교표

10단계에서 `src/features/{applications,essays,materials,calendar,auth}`의 `types.ts`/`api/dto.ts`/`api/mapper.ts`/`mock-data.ts`를 백엔드 DTO와 전부 대조했다. 결론: **enum 값과 필드 이름은 DTO 레벨에서 전부 일치한다.** 실제로 손볼 지점은 거의 다 프론트 view-model(화면용 타입)이 DTO의 일부만 따라가고 있는 것이지, 백엔드가 뭘 잘못 내려주는 게 아니다.

| 영역 | 프론트 타입 | 프론트 필드 | 백엔드 DTO | 백엔드 필드 | 변환 필요 | 충돌 | 수정 대상 |
|---|---|---|---|---|---|---|---|
| 지원 건 | `ApplicationDto.id` | `number` | `ApplicationResponse.id` | `Long`→JSON number | 예(`String(dto.id)`, 이미 mapper에 있음) | 없음 | 없음 |
| 지원 건 | `ApplicationStatusDto` | 8개 문자열 | `ApplicationStatus` | 8개 | 예(mapper crosswalk 존재) | 없음 | 없음 |
| 지원 건 | `RecruitmentSeasonDto` | 3개 | `RecruitmentSeason` | 3개 | 예(mapper crosswalk 존재) | 없음 | 없음 |
| 지원 건 | `ApplicationDetail.materials/checklist`, `essay.questionCount/answerCount` | 하드코딩 `[]`/`0` | `ApplicationResourcesResponse`(9단계), `EssayQuestionResponse[]` | 실제 값 있음 | 예 | **있음** — 프론트가 아직 이 API들을 호출하지 않음 | 프론트 20단계: `application-detail`에 `GET /api/applications/{id}/resources`, `GET /api/applications/{id}/essay-questions` 연결 필요 |
| 지원 건 | `ApplicationListItem.progress` | 클라이언트 계산(상태별 고정 매핑) | 없음 | — | 해당 없음 | 없음(의도된 설계) | 없음 |
| 자소서 | `EssayAnswerDto.id/questionId/applicationId` | `number` | `EssayAnswerResponse` | `Long` | 예 | 없음 | 없음 |
| 자소서 | `CommonQuestionTypeDto` | 9개 | `CommonQuestionType` | 9개 | 예(mapper crosswalk 존재) | 없음 | 없음 |
| 자소서 | `EssayAnswerStatusDto` | `DRAFT/SUBMITTED/IMPROVED` | `EssayAnswerStatus` | 동일 | 예(mapper crosswalk 존재) | 없음 | 없음 |
| 자소서 | `EssayAnswerDto`에 `commonQuestionType`/`season`/`characterLimit` 없음 | — | `EssayAnswerResponse`도 동일하게 없음(문항 조인 필요) | — | 예(프론트가 `EssayQuestionResponse`와 합쳐야 함) | 설계상 필요한 조인, 결함 아님 | 프론트 20단계 essay 화면 연결 시 두 응답을 합치는 로직 필요(이미 essay-api.ts 주석에 인지돼 있음) |
| 자소서 | `EssayAnswerDetail.competencyTags` | 하드코딩 `[]` | 없음(`experienceTags`만 존재) | — | — | 없음(백엔드에 애초에 역량 태그 개념 없음) | 프론트가 필요 없으면 그대로, 필요하면 별도 요구사항으로 논의 |
| 자격증 | `CredentialDto.id/fileAssetId` | `number` | `CredentialResponse` | `Long` | 예 | 없음 | 없음 |
| 자격증 | `CredentialTypeDto` | 5개 | `CredentialType` | 5개 | 예(mapper crosswalk 존재) | 없음 | 없음 |
| 자격증 | `Credential.evidenceFileName` | `` `파일 #${fileAssetId}` `` (합성 문자열) | `FileAssetResponse.displayName/originalFilename` | 실제 파일명 있음 | 예 | **있음** — mapper가 실제 파일명을 안 씀 | 프론트 20단계: 자격증 상세 화면에서 `fileAssetId`로 `GET /api/files/{id}`를 조회해 실제 파일명 표시 |
| 자격증 | `CredentialUsageHistory` | mock 전용, DTO 없음 | 대응 API 없음(`GET /api/applications/{id}/resources`로 역방향 조회는 가능하지만 "이 자격이 어느 지원 건에 쓰였는지" 정방향 조회 API는 없음) | — | — | **있음(작은 gap)** | 필요하면 프론트가 지원 건 목록을 순회해 `resources.credentials`에서 역으로 찾거나, 백엔드에 `GET /api/credentials/{id}/applications` 같은 endpoint 추가를 다음 단계로 논의 |
| 파일 | `FileCategoryDto` | 7개 | `FileCategory` | 7개, 완전 일치 | 예(mapper crosswalk 존재) | 없음(DTO 레벨) | — |
| 파일 | `MaterialFileType`(view) | 6개(`CAREER_CERTIFICATE` 없음) | — | — | — | **있음(프론트 전용)** | `CAREER_CERTIFICATE`로 업로드한 파일은 현재 UI에서 "기타"로만 보이고 그 값으로 새로 업로드할 선택지가 없음. 프론트가 원하면 `MaterialFileType`에 값 추가 |
| 파일 | `MaterialFile.isUsed` | 하드코딩 `false` | 대응 필드 없음(연결 여부는 `application_files` 존재 여부로 판단 가능) | — | 예 | **있음(작은 gap)** | 정방향 "이 파일이 어디에 쓰였는가" 조회 API가 없음(자격증과 같은 문제). 필요하면 다음 단계 논의 |
| 외부 링크 | `LinkTypeDto` | 9개 | `LinkType` | 9개, 완전 일치 | 예(mapper crosswalk 존재) | 없음(DTO 레벨) | — |
| 외부 링크 | `ExternalLinkType`(view) | 7개(`DEPLOYED_SERVICE`/`PROJECT_REPOSITORY` 없음) | — | — | — | **있음(프론트 전용)** | 두 값으로 등록하면 표시가 깨지진 않지만(문자열 그대로 안 보여줄 뿐) UI에서 선택할 수 없음. 프론트가 원하면 `ExternalLinkType`에 값 추가 |
| 외부 링크 | `ExternalLinkRequestDto.visibility` | 항상 `"PRIVATE"` 하드코딩 전송 | `ExternalLinkRequest.visibility` | 값 그대로 저장 | — | 없음(의도된 설계, 공개 전환 UI가 아직 없음) | — |
| 캘린더 | `CalendarEventType`/`CalendarSyncStatus`/`ReminderChannel` | 각각 12/4/3개 | `EventType`/`SyncStatus`/`ReminderChannel` | 동일 12/4/3개, 완전 일치(8단계에서 프론트 리터럴을 그대로 백엔드에 옮김) | 예(id `string(dto.id)` 변환만 필요, 프론트에 아직 mapper 없음) | 없음(값 자체는 일치) | **DTO/mapper 자체가 없음** — 프론트 `calendar/api/calendar-api.ts`가 여전히 `contractStatus: "pending"`이고 `GET /api/calendar/events` 등 5개 endpoint가 "백엔드 명세 없음"이라고 적혀 있음(8단계 이전 상태로 stale). 프론트 18~20단계에서 `calendar/api/dto.ts`+`api/mapper.ts` 신규 작성 필요 |
| 캘린더 | `CalendarEvent.applicationId/id` | `string` | `RecruitmentEventResponse.id/applicationId` | `Long` | 예(신규 작성 시 `String()` 변환 추가) | 없음 | 위와 동일 |
| 인증 | `CurrentUserDto.provider` | `"GOOGLE"` | `CurrentUserResponse.provider` | `AuthProvider.GOOGLE` → `"GOOGLE"` | 예(mapper가 `"Google"`로 하드코딩 변환) | 없음(의도된 표시용 변환) | — |
| 공통 | 모든 DTO의 `id` 계열 필드 | `number` | 전 도메인 `Long` | JSON number로 직렬화 | 예, 전 도메인에서 `String(dto.id)` 패턴 이미 확립됨 | 없음 | — |
| 공통 | 날짜(`Instant`) 필드 | `string`(mapper가 `Date`로 변환) | ISO-8601 `...Z` | 그대로 | 예 | 없음 | — |
| 공통 | 날짜(`LocalDate`) 필드 | `string` | `2024-06-21` | 그대로 | 예 | 없음 | — |
| 공통 | nullable 필드 | `T \| null` | `null` 포함, 키 생략 안 됨 | 그대로 | 아니오 | 없음 | — |

추가로(비교표에 넣기엔 코드 품질 메모라 별도 기재): `src/features/materials/materials-service.ts`는 실제 화면에서 쓰이는데도 `mock-data.ts`만 읽고 위 API들을 전혀 호출하지 않는다. 그 파일 주석은 `GET /api/material-files`, `GET /api/material-links`라는, 실제로 존재한 적 없는 경로를 "명세 확정 필요"로 적어 두고 있다 — 실제 경로는 `GET /api/files`, `GET /api/external-links`다. 20단계에서 이 서비스 레이어를 실제 API로 바꿀 때 이 주석에 낚이지 않아야 한다.

---

# MVP 완료 시나리오 검증 결과

기획서 시나리오를 `backend/src/test/java/com/careerdock/scenario/MvpScenarioIntegrationTest.java` 하나로 처음부터 끝까지 이어서 검증했다(Testcontainers PostgreSQL, 실제 실행 확인 — 아래 "실행한 테스트" 참고).

| 단계 | API 호출 | 결과 |
|---|---|---|
| 로그인 | `GET /api/auth/me` | Google OAuth 리다이렉트 자체는 브라우저가 필요해 이 테스트로 재현 불가. 이미 로그인된 세션에서 `/me`가 본인 정보를 정확히 돌려주는지만 확인(통과). OAuth 흐름 자체는 `OAuthUserProvisionerTest`, `AuthControllerTest`가 별도로 검증 |
| SQLD 자격증 등록 | `POST /api/credentials` | 통과 — 마스킹 값(`SQLD************`) 확인, 평문 미노출 확인 |
| GitHub·Notion 링크 등록 | `POST /api/external-links` ×2 | 통과 |
| KB국민은행 IT 개발 지원 건과 마감일 등록 | `POST /api/applications` | 통과 — `deadlineAt` 왕복 확인 |
| 실제 자소서 문항과 답변 저장 | `POST .../essay-questions`, `POST .../answers` | 통과 |
| 지원동기 유형과 LOODI 경험 태그 연결 | 문항 생성 시 `commonQuestionType: MOTIVATION`, `POST /api/experience-tags` + `POST .../tags` | 통과 |
| 증명사진·자격증·포트폴리오를 지원 건에 연결 | `POST /api/files`(PROFILE_PHOTO, PORTFOLIO) → `POST .../files` ×2, `POST .../credentials` ×1 | 통과 |
| 재조회(새로고침 시뮬레이션) | `GET /api/applications/{id}/resources`, `GET /api/external-links`, `GET /api/credentials/{id}/number` | 통과 — 별도 요청으로 커밋된 DB를 다시 읽어 값이 그대로 유지됨을 확인 |
| 다른 사용자 격리 | 위 모든 자원을 제2사용자 세션으로 재조회 | 통과 — 전부 `404` 또는 빈 목록 |

---

# 실행한 테스트

아래는 이 문서를 작성하며 실제로 실행한 명령과 결과다. 실행하지 않은 항목은 "실행하지 않음"으로 명시한다.

- `./gradlew clean test build` — **실행함**, `BUILD SUCCESSFUL`, 8 tasks 실행. Testcontainers가 PostgreSQL 16-alpine 컨테이너를 실제로 띄워 전체 스위트를 돌렸다(Colima 환경, `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE` 필요 — README 참고).
- 전체 테스트: **73개 통과, 0 실패**(13개 테스트 클래스 + 신규 `MvpScenarioIntegrationTest` 1개).
- `./gradlew build` 단독 재실행 — **실행함**, 성공.
- 로컬 PostgreSQL(Docker 밖 실제 인스턴스)에 대한 수동 curl 테스트 — **실행하지 않음**. Testcontainers가 매 테스트마다 진짜 PostgreSQL 컨테이너를 새로 검증하므로 커버리지는 있지만, `docker compose up -d postgres` + `./gradlew bootRun` 조합의 수동 curl 시나리오는 별도로 돌리지 않았다.
- Google 실계정을 이용한 브라우저 OAuth 왕복 — **실행하지 않음**(자동화 불가 영역, 코드 리뷰와 `OAuthUserProvisionerTest`로만 검증).

## 클래스별 결과

| 테스트 클래스 | 개수 | 결과 |
|---|---|---|
| `CareerdockApplicationTests` | 1 | 통과 |
| `HealthControllerTest` | 1 | 통과 |
| `AuthControllerTest` | 3 | 통과 |
| `OAuthUserProvisionerTest` | 2 | 통과 |
| `UserRepositoryTest` | 2 | 통과 |
| `ApplicationControllerTest` | 9 | 통과 |
| `EssayControllerTest` | 4 | 통과 |
| `CredentialControllerTest` | 11 | 통과 |
| `ExternalLinkControllerTest` | 4 | 통과 |
| `FileControllerTest` | 10 | 통과 |
| `CalendarControllerTest` | 13 | 통과 |
| `ApplicationResourceControllerTest` | 9 | 통과 |
| `GlobalExceptionHandlerTest` | 3 | 통과 |
| `MvpScenarioIntegrationTest`(10단계 신규) | 1 | 통과 |
| **합계** | **73** | **73 통과, 0 실패** |

---

# 보안 검증 결과

| 항목 | 결과 |
|---|---|
| Request로 `userId` 입력받는 endpoint | 없음 — `dto` 패키지 전체 grep으로 확인, `userId`가 나오는 유일한 곳은 주석("userId는 받지 않는다") |
| 모든 소유 데이터에 사용자 조건 | 있음 — 지원 건·자소서·자격증·파일·외부 링크·일정·지원 건 연결 전부 `findByIdAndUserId` 계열로 조회, 목록도 `userId` 조건 포함 |
| 다른 사용자 ID로 접근 시도 | `404 NOT_FOUND`로 일관 응답(각 도메인 테스트에서 확인). `403`을 실제로 내려주는 코드 경로는 현재 없음(존재를 숨기는 정책상 의도적으로 `404`만 사용) |
| 자격번호 전체 조회 | 본인 소유만 복호화, 조회마다 `credential_access_audits`에 기록 남김. 목록·상세 응답에는 마스킹 값만 노출 |
| 파일 다운로드 | 본인 소유만 허용, 항상 `Content-Disposition: attachment`, 공개 URL 미발급, 저장 경로 traversal 방지(`LocalFileStorage.resolve`가 루트 밖 이탈 시 거부) 확인 |
| OAuth Redirect | Authorization Code, Access Token, Refresh Token, 내부 오류 메시지 모두 Redirect URL에 미포함(코드 확인) |
| Secret 로깅 | `git grep`으로 `log.*token/secret/password/credentialNumber` 계열 로깅 코드 없음 확인. `CREDENTIAL_ENCRYPTION_KEY`/`GOOGLE_CLIENT_SECRET`은 환경변수로만 주입, 코드/로그에 하드코딩 없음(`.env.example`은 예시 값만) |
| SQL 로그 개인정보 | `application-local.yml`의 `hibernate.show-sql: false`. `logging.level` 설정 자체가 어느 프로필에도 없어 SQL 바인드 파라미터가 찍히는 debug 로깅 경로가 없음 |
| CORS 전체 허용 여부 | 아님 — `ALLOWED_ORIGINS`로 지정한 origin만 허용(기본값 `http://localhost:3000`), `allow-credentials: true` |
| Cookie 설정 | `http-only: true` 고정, `secure`/`same-site`는 환경변수(로컬 `false`/`Lax`, 운영은 `true`/`None` 권장 — README에 명시) |

---

# 프론트 연동 가이드

## 18단계에서 필요한 환경변수

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
# 선택, 기본값 이미 일치하므로 안 넣어도 됨
NEXT_PUBLIC_GOOGLE_OAUTH_START_PATH=/oauth2/authorization/google
```

`NEXT_PUBLIC_API_BASE_URL`은 필수다 — 비어 있으면 프론트가 즉시 에러를 던진다. 백엔드 쪽은 `.env`에 `FRONTEND_URL=http://localhost:3000`, `ALLOWED_ORIGINS=http://localhost:3000`을 맞춰 둬야 CORS와 OAuth Redirect가 정상 동작한다.

## 19단계: Google 로그인 연결 방법

1. 로그인 버튼 클릭 시 `window.location.href`를 `{NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/google`로 이동시킨다(현재 `oauth-api.ts`의 `getGoogleOAuthStartUrl()`이 이미 이 경로를 만든다 — 그대로 쓰면 됨).
2. Google 인증이 끝나면 백엔드가 `{FRONTEND_URL}/dashboard`(성공) 또는 `{FRONTEND_URL}/login?error=oauth_failed`(실패)로 브라우저를 리다이렉트한다. 프론트는 이 리다이렉트를 받는 페이지만 있으면 되고, Authorization Code나 토큰을 직접 처리할 필요가 없다.
3. 로그인 여부 확인은 `GET /api/auth/me`를 `credentials: "include"`로 호출해 `200`이면 로그인, `401`이면 비로그인으로 판단한다(`server-auth.ts`가 이미 이렇게 구현돼 있음).
4. 로그아웃은 `POST /api/auth/logout`.
5. 이 저장소의 `login-form.tsx`/`signup-form.tsx`(이메일/비밀번호 폼)는 실제 백엔드에 대응하는 endpoint가 없다 — Google OAuth 버튼(`google-login-button.tsx`)이 유일한 실제 로그인 경로다.

## 20단계: 기능별 연동 순서 제안

이미 `contractStatus: "confirmed"`인 것부터, 그 다음 새로 만들어야 하는 것 순서로 제안한다.

1. **Auth** — 이미 연결 구조 있음(`server-auth.ts`). 세션 쿠키 왕복만 실제로 켜서 확인.
2. **Application** — DTO/mapper 이미 완성. `ApplicationDetail.materials/checklist`, `essay.questionCount/answerCount`의 하드코딩 `[]`/`0`을 실제 API 응답으로 교체하는 작업이 이 단계의 핵심.
3. **Credential / External Link / File** — DTO/mapper 이미 완성이지만 실제 화면(`materials-service.ts`)은 아직 mock만 읽는다. 이 서비스 레이어를 `credential-api.ts`/`external-link-api.ts`/`file-api.ts` 호출로 교체.
4. **Essay** — DTO/mapper 있음. 화면 연결 시 `EssayAnswerResponse` + `EssayQuestionResponse`를 합치는 로직이 필요(주석에 이미 인지돼 있음).
5. **Calendar** — DTO/mapper가 아예 없다. 이 문서의 Calendar API 섹션을 기준으로 `calendar/api/dto.ts` + `api/mapper.ts`를 새로 작성해야 한다. Enum 값은 이미 프론트 `types.ts`와 완전히 같으므로 crosswalk 없이 그대로 매핑 가능.
6. **Application Resources** — 9단계 신규 API라 프론트에 아직 어떤 코드도 없다. `ApplicationMaterialsSection`의 placeholder를 이 API로 교체.

---

# 이번 단계에서 하지 않은 것

요청대로 새 기능을 추가하지 않았다: Google Calendar 실제 동기화, 실제 알림 발송, OCR, AI, 새 도메인, 불필요한 리팩터링, 기존 API 응답 임의 변경. 유일한 코드 변경은 검증을 위한 통합 테스트 1개 파일(`MvpScenarioIntegrationTest`) 추가뿐이다.
