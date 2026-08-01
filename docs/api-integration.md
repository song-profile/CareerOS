# CareerDock API Integration Notes

작성일: 2026-08-02

## 현재 확인 결과

- 저장소 안에 `docs/api-spec.md`, OpenAPI/Swagger 명세, 백엔드 Spring Boot 코드, Docker Compose 설정은 없다.
- `.env.example`은 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`를 사용한다.
- `.gitignore`는 `.env`, `.env*.local`을 제외한다.
- 인증 방식, CORS, Cookie, 예외 응답, Pagination, 파일 업로드 필드명은 아직 확인할 수 없다.

## 프론트 연동 원칙

- 컴포넌트에 endpoint 문자열을 직접 작성하지 않는다.
- 실제 API 전환 전까지 Mock Data는 유지한다.
- API 응답과 UI View Model이 다르면 mapper를 기능별 API 모듈 또는 service 계층에 둔다.
- FormData 업로드 요청에는 `Content-Type`을 직접 지정하지 않는다.
- 인증 방식 확정 전에는 localStorage에 token을 저장하지 않는다.

## 백엔드에서 확인이 필요한 항목

- 인증 방식: HttpOnly Cookie, Bearer Token, Session 중 무엇인지
- CORS 허용 Origin과 `credentials` 허용 여부
- 공통 오류 응답 필드: `status`, `code`, `message`, `fieldErrors`, `requestId`, `details` 제공 여부
- Pagination 응답 구조
- 파일 업로드 Content-Type, multipart field 이름, S3 presigned URL 사용 여부
- Health Check 또는 공개 상태 확인 endpoint
