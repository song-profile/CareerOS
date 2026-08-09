# CareerDock 포트폴리오 설명

이 문서는 면접이나 팀 프로젝트 발표에서 CareerDock을 설명하기 위한 요약 자료다. 현재 저장소에 구현된 내용만 기준으로 작성한다.

## 한 줄 소개

CareerDock은 취업 준비자가 여러 회사에 지원하면서 생기는 마감, 자소서, 제출 자료, 일정 정보를 한곳에서 연결해 관리하는 서비스입니다.

## 문제와 해결

문제:

- 지원 마감, 자소서, 파일, 자격증 번호가 여러 도구에 흩어진다.
- 제출 당시 어떤 자소서와 자료를 사용했는지 나중에 확인하기 어렵다.
- 대시보드가 여러 API를 동시에 호출하면 초기 화면 계약이 복잡해진다.

해결:

- `Application`을 중심으로 자소서, 자료, 일정, 파일을 연결한다.
- 자소서 답변은 버전으로 관리하고 제출본은 잠근다.
- 대시보드 첫 화면은 Summary API 하나로 필요한 데이터를 조회한다.

## OAuth 로그인

구현 내용:

- Spring Security OAuth2 Login으로 Google 로그인을 처리한다.
- 프론트는 `/oauth2/authorization/google`로 redirect만 수행한다.
- OAuth callback은 Spring Security가 처리한다.
- 로그인 성공 후 서버 세션과 HttpOnly `JSESSIONID` Cookie로 인증 상태를 유지한다.
- `/api/auth/me`로 현재 사용자 정보를 확인한다.

설명 포인트:

- Client Secret은 backend 환경변수로만 주입한다.
- 프론트는 Google Access Token, Refresh Token, Authorization Code를 저장하지 않는다.
- 과거 OIDC 회귀를 막기 위해 `openid` scope를 제외하고 OAuth2 사용자 서비스 경로를 테스트했다.

## 사용자 데이터 격리

구현 내용:

- API request로 `userId`를 받지 않는다.
- Spring Security Principal에서 내부 사용자 ID를 얻는다.
- Repository query는 사용자 ID 조건을 포함한다.
- 다른 사용자 리소스 접근은 `404 NOT_FOUND`로 처리한다.

설명 포인트:

- 클라이언트가 ID를 조작해도 서버에서 소유자 조건을 다시 검증한다.
- 존재 여부 노출을 줄이기 위해 권한 없는 리소스는 403 대신 404 정책을 사용한다.

## Dashboard Summary API

Endpoint:

```text
GET /api/dashboard/summary
```

목표:

- 대시보드 첫 화면에서 Application API, Calendar API를 여러 번 호출하지 않는다.
- 화면에 필요한 최소 필드만 반환한다.

포함 데이터:

- 이번 주 마감 수
- 작성 중 지원서 수
- 다가오는 일정 수와 목록
- 임박한 지원 마감 목록

설명 포인트:

- `deadlineAt = null`은 마감 집계에서 제외한다.
- 종료 상태 지원 건은 임박 마감 집계에서 제외한다.
- 일정은 미래 시작일 기준으로 조회한다.
- 정렬과 limit은 DB query에서 처리한다.

## 자소서 버전 관리

구현 내용:

- 지원 건별 자소서 문항을 관리한다.
- 답변을 생성하고 수정할 수 있다.
- 답변 버전을 생성할 수 있다.
- 제출본 잠금으로 제출 당시 내용을 보호한다.
- 경험 태그를 답변에 연결할 수 있다.

설명 포인트:

- 제출본을 덮어쓰지 않고 버전으로 남겨 나중에 추적할 수 있게 했다.
- 회사별/지원 건별 제출 내용을 재확인하는 데 초점을 맞췄다.

## 자료/파일 관리

구현 내용:

- 자격증/어학/수상/교육 문서 등 자료를 관리한다.
- 자격번호는 기본 마스킹하고, 전체 번호는 별도 API로 조회한다.
- 외부 링크는 GitHub, Notion, Blog, LinkedIn, 배포 서비스, 프로젝트 repository, 기타 유형을 지원한다.
- 파일은 `multipart/form-data`로 업로드하고, API를 통해 다운로드한다.

설명 포인트:

- 민감정보를 화면에 기본 노출하지 않는다.
- 파일은 공개 웹 루트에 두지 않고 backend API를 통해 접근한다.
- 지원 건에 필요한 자료를 연결해 제출 전 확인 흐름을 만들었다.

## 캘린더

구현 내용:

- CareerDock 내부 일정 API와 프론트 화면이 연결되어 있다.
- 월간 범위 조회, 다가오는 일정, 상세, 등록, 수정, 삭제를 지원한다.
- 일정은 지원 건과 연결할 수 있다.
- 일정 타입은 전형 단계와 개인 준비 일정을 구분한다.

설명 포인트:

- 화면 월 범위 기준으로 필요한 일정만 조회한다.
- 일정 생성/수정 시 서버 DTO와 UI view model을 mapper로 분리한다.
- Google Calendar 권한은 로그인과 분리해 사용자가 설정 화면에서 연결할 때만 요청한다.

## Docker

구현 내용:

- root `docker-compose.yml`로 PostgreSQL, Backend, Frontend를 함께 실행한다.
- Backend와 Frontend는 multi-stage Dockerfile을 사용한다.
- Frontend는 Next.js standalone output으로 실행한다.
- PostgreSQL과 업로드 파일은 named volume으로 유지한다.

검증 명령:

```bash
docker compose config
docker compose build
docker compose up -d
docker compose ps
```

설명 포인트:

- 컨테이너 내부 통신은 `localhost`가 아니라 service name을 사용한다.
- OAuth Redirect URI는 컨테이너 내부 주소가 아니라 브라우저 외부 URL 기준으로 설정한다.

## 테스트

Backend:

- JUnit 5, Spring Security Test, Testcontainers PostgreSQL
- OAuth 사용자 생성/재로그인, Principal, `/api/auth/me`, Dashboard Summary, Calendar, Materials 계층 테스트

Frontend:

- Vitest, Testing Library
- GoogleLoginButton, Dashboard Summary, Materials Service, Calendar Service, API error 분기 테스트
- `npm run typecheck`, `npm run lint`, `npm run build`로 정적 검증

## 발표용 기술 의사결정

- 인증은 토큰을 프론트에 저장하지 않기 위해 HttpOnly Cookie 세션을 사용했다.
- 대시보드는 여러 도메인 API 호출 대신 Summary endpoint를 만들었다.
- 민감한 자격번호는 마스킹과 별도 조회 API로 분리했다.
- 프론트는 DTO와 ViewModel을 mapper로 분리해 화면이 backend entity 구조에 묶이지 않게 했다.
- Docker Compose에서 browser-facing URL과 container-internal URL을 분리했다.

## 남은 개선 과제

- 운영 배포용 HTTPS/reverse proxy/CI 구성
- Google Calendar 상세 오류 복구 UX 고도화
- 알림 기능
- OpenAPI/Swagger 문서 자동화
- npm audit high severity 항목 검토
