# CareerDock Google OAuth Integration Notes

작성 기준: 현재 저장소 구현

## 현재 구현 상태

CareerDock 로그인은 Spring Security OAuth2 Login과 서버 세션을 사용한다.

- OAuth 시작 URL: `GET /oauth2/authorization/google`
- OAuth callback URL: `GET /login/oauth2/code/google`
- 현재 사용자 조회: `GET /api/auth/me`
- 로그아웃: Spring Security logout endpoint와 프론트 logout API 흐름 사용
- 인증 유지: HttpOnly `JSESSIONID` Cookie
- 프론트 API 요청: `credentials: "include"`

프론트는 Google 인증 페이지로 redirect만 수행하며, Google token이나 authorization code를 직접 다루지 않는다.

## 설정 항목

Backend runtime에는 다음 환경변수가 필요하다.

```bash
GOOGLE_CLIENT_ID=replace-with-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

Frontend runtime에는 다음 환경변수가 필요하다.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_OAUTH_START_PATH=/oauth2/authorization/google
```

실제 Client ID, Client Secret은 문서와 Git에 남기지 않는다.

## Google Cloud Console 설정

로컬 개발용 Authorized redirect URI:

```text
http://localhost:8080/login/oauth2/code/google
http://localhost:8080/api/calendar/oauth/callback
```

첫 번째는 Google 로그인용이고, 두 번째는 로그인 후 사용자가 Calendar 연결 버튼을 눌렀을 때 쓰는 Google Calendar 권한 동의용이다. 운영 배포 시에는 운영 backend 외부 URL 기준 redirect URI를 별도로 등록해야 한다.

## 보안 원칙

- Client Secret은 backend 환경변수로만 주입한다.
- Access Token, Refresh Token, Authorization Code를 브라우저 저장소에 저장하지 않는다.
- 인증 상태는 서버 세션과 HttpOnly Cookie로 유지한다.
- 운영에서 프론트/백엔드 도메인이 분리되면 HTTPS, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=None`, 정확한 `ALLOWED_ORIGINS` 설정이 필요하다.
- OAuth `state` 검증은 Spring Security OAuth2 Client가 담당한다.

## 회귀 방지 포인트

과거 `scope`에 `openid`가 포함되면 Spring Security가 OIDC 흐름을 선택해 프로젝트의 커스텀 OAuth 사용자 서비스 경로가 우회될 수 있었다.

현재 문서 기준의 로그인 흐름은 OAuth2 UserService 경로를 사용한다. 관련 테스트는 다음 내용을 검증한다.

- `openid` scope 미포함
- 로그인 후 principal 타입
- 최초 로그인 시 사용자 자동 생성
- 동일 Google subject 재로그인 시 중복 사용자 생성 방지
- `/api/auth/me` 인증/비인증 응답
