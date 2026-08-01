# CareerDock Stage 13-20 Audit

작성일: 2026-08-02

## 결론

- Stage 13, 15, 17, 18, 19의 프론트 구현 기반은 빌드 가능한 상태다.
- Stage 20의 실제 Spring Boot API 전환은 진행하지 않았다.
- 이유: 저장소와 원격 브랜치에 백엔드 코드, `docs/api-spec.md`, OpenAPI/Swagger 명세가 없고 `localhost:8080` 백엔드도 실행 중이지 않다.
- API DTO와 endpoint를 추측하지 않는 원칙 때문에 Mock Data 제거와 실제 DB 연동은 보류한다.

## Stage 13 - 파일 보관함

- 상태: 완료
- 경로: `/materials/files`
- 구현: 파일 목록, 검색, 유형 필터, 미리보기/다운로드/삭제 placeholder, 업로드 버튼 UI, Empty/Loading/Error
- 데이터: `materialFileMockData`
- 실제 미구현: 업로드, 다운로드, S3, 파일 삭제 API

## Stage 15 - 외부 링크 관리

- 상태: 완료
- 경로: `/materials/links`
- 구현: 목록, 등록/수정 Dialog, 삭제 placeholder, 검색, 복사, 새창 열기, Empty/Loading/Error
- 데이터: `externalLinkMockData`
- 실제 미구현: 외부 링크 CRUD API

## Stage 17 - 캘린더

- 상태: 완료
- 경로: `/calendar`, `/calendar/new`, `/calendar/:id`, `/calendar/:id/edit`
- 구현: 월간 캘린더, 날짜 선택, 다가오는 일정, 상세, 등록/수정 폼, 삭제 확인 UI, 지원 건 연결 UI
- 데이터: `calendarEventMockData`
- 실제 미구현: 일정 CRUD API, Google Calendar OAuth/API, 실제 알림 전송

## Stage 18 - API 기반

- 상태: 완료 가능한 범위 완료
- 구현: 공통 API Client 보완, 오류 타입, API 응답 타입, 기능별 API 모듈 골격, 환경변수 문서
- 실제 미확정: 인증 방식, CORS, Cookie, Pagination, 파일 업로드 방식, 공통 오류 응답

## Stage 19 - Google OAuth

- 상태: 부분 완료, 실제 연동 차단
- 구현: Google 로그인 버튼 UI, OAuth 시작 URL 환경변수 구조, OAuth 확인 문서
- 차단: 백엔드 OAuth 시작 URL, Callback URL, Cookie/Token 방식, `/me`, logout endpoint 미확정
- 보안: Client Secret, Authorization Code, Access Token, Refresh Token은 프론트에 넣지 않음

## Stage 20 - 실제 API 전환

- 상태: 차단
- 이유:
  - Spring Boot 백엔드 코드 없음
  - API 명세 없음
  - Swagger/OpenAPI 없음
  - `localhost:8080` 연결 실패
  - 지원 건 endpoint와 DTO 확인 불가
- 필요한 백엔드 산출물:
  - 인증 방식과 OAuth endpoint
  - 지원 건 CRUD endpoint와 DTO
  - 자소서 endpoint와 DTO
  - 자격증 endpoint와 민감정보 마스킹 정책
  - 외부 링크 endpoint와 DTO
  - 일정 endpoint와 DTO
  - 공통 오류 응답 구조
  - Pagination 구조
  - CORS/Cookie 설정

## 검증 결과

- `npm run lint`: 통과
- `npm run typecheck`: 통과
- `npm run build`: 통과
- `curl -I http://localhost:8080/actuator/health`: 연결 실패

## 정리한 문제

- `src/app/(app)/calendar/page 2.tsx` 중복 placeholder 파일을 제거했다.

## 다음 작업 순서

1. 백엔드 실행 또는 API 명세 확보
2. Google OAuth endpoint 확인
3. `/api/auth/me` 기준 현재 사용자 타입 작성
4. 지원 건 목록 조회부터 실제 API 전환
5. 등록/수정/삭제/상태 변경 순서로 지원 건 연동
6. 자소서, 자격증, 외부 링크, 일정 순서로 Mock import 단계적 제거
