# CareerDock API Integration Notes

작성일: 2026-08-02

## 현재 확인 결과

- 저장소 안에 `docs/api-spec.md`와 Spring Boot 백엔드 코드가 있다.
- OpenAPI/Swagger 명세는 아직 없다.
- `.env.example`은 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`를 사용한다.
- `.gitignore`는 `.env`, `.env*.local`을 제외한다.
- 인증 방식은 Spring Security Session + HttpOnly `JSESSIONID` Cookie이다.
- 공통 오류 응답은 `timestamp`, `status`, `code`, `message`, `fieldErrors`, `path`, `requestId` 구조를 따른다.
- 지원 건, 자소서, 자격증, 파일, 외부 링크 API는 현재 백엔드 controller와 DTO가 있다.
- Calendar API는 아직 백엔드 controller/DTO가 없어 pending 상태로 둔다.

## 프론트 연동 원칙

- 컴포넌트에 endpoint 문자열을 직접 작성하지 않는다.
- 실제 API 전환 전까지 Mock Data는 유지하고, 화면별 교체 시 service 함수 내부에서만 API 모듈로 연결한다.
- API 응답과 UI View Model이 다르면 mapper를 기능별 API 모듈 또는 service 계층에 둔다.
- FormData 업로드 요청에는 `Content-Type`을 직접 지정하지 않는다.
- 프론트는 토큰을 저장하지 않는다. 인증 상태는 HttpOnly Cookie 세션으로 유지한다.

## 백엔드에서 확인이 필요한 항목

- Calendar API endpoint와 DTO
- 프로필 기본정보 API endpoint와 DTO
- Application 상세에서 제출 파일, 체크리스트, 자소서 요약을 내려줄지 여부
- Essay 목록 응답에 기존 라이브러리 화면이 요구하는 `season`, `characterLimit`, `commonQuestionType` 등을 포함할지 여부
- Pagination 도입 시 응답 구조
- Health Check 또는 공개 상태 확인 endpoint
