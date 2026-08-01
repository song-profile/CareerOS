# CareerDock Google OAuth Integration Notes

작성일: 2026-08-02

## 확인 결과

- 현재 저장소에는 Spring Boot 백엔드 코드가 없다.
- `docs/api-spec.md`, OpenAPI/Swagger 명세, OAuth endpoint 문서가 없다.
- 원격 브랜치에도 백엔드 브랜치는 확인되지 않았다.
- `localhost:8080`의 OAuth 후보 endpoint는 연결되지 않았다.

## 현재 프론트 구현 상태

- Google 로그인 버튼 UI는 로그인/회원가입 화면에 추가했다.
- 실제 OAuth 시작 URL은 추측하지 않는다.
- `NEXT_PUBLIC_GOOGLE_OAUTH_START_PATH`가 비어 있으면 버튼은 비활성화된다.
- 값이 설정되면 `NEXT_PUBLIC_API_BASE_URL`과 조합해 redirect 방식으로 이동한다.

## 백엔드에서 반드시 확정해야 할 항목

- OAuth 시작 URL
- OAuth callback URL
- 성공 redirect URL
- 실패 redirect URL
- 현재 사용자 조회 endpoint와 응답 JSON
- 로그아웃 endpoint와 method
- 인증 방식: HttpOnly Cookie, Bearer Token, Session 중 무엇인지
- Cookie `SameSite`, `Secure`, Domain, Path 설정
- CORS `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`
- CSRF 방어 방식
- OAuth `state` 검증 담당 위치

## 보안 원칙

- Google Client Secret은 프론트 코드와 환경변수에 두지 않는다.
- Authorization Code, Access Token, Refresh Token을 화면이나 로그에 노출하지 않는다.
- 인증 방식 확정 전에는 localStorage를 사용하지 않는다.
- 보호 페이지 처리는 Cookie/Session 확인 가능 여부를 확인한 뒤 구현한다.
