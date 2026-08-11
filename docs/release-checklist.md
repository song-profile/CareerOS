# CareerDock Release Checklist

이 문서는 릴리스 직전 수동 확인과 자동 검증 결과를 기록하기 위한 체크리스트다.
실제 Secret 값은 이 문서나 Git 추적 파일에 기록하지 않는다.

## Required Checks

- [ ] Secrets: Git 추적 파일에 실제 Secret, 토큰, 운영 DB 비밀번호, 암호화 키가 없는지 확인
- [ ] DB migration: 새 DB에서 Flyway migration이 처음부터 적용되는지 확인
- [ ] DB migration: 기존 DB volume에서 최신 migration upgrade가 깨지지 않는지 확인
- [ ] Backend test: `cd backend && ./gradlew test`
- [ ] Backend build: `cd backend && ./gradlew build`
- [ ] Frontend typecheck: `npm run typecheck`
- [ ] Frontend lint: `npm run lint`
- [ ] Frontend test: `npm test`
- [ ] Frontend build: `npm run build`
- [ ] Docker config: `docker compose config`
- [ ] Docker build: `docker compose build`
- [ ] Google Login: 실제 Google 계정으로 최초 로그인, 재로그인, 로그아웃 확인
- [ ] Google Calendar: 별도 Calendar 동의, 연결 상태, 재동기화, 연결 해제 확인
- [ ] User isolation: 사용자 A/B 데이터 조회, 수정, 삭제 격리 확인
- [ ] File upload: 허용 파일 업로드, 다운로드, 권한 오류, 용량/형식 오류 확인
- [ ] Notification: 마감/일정/자격 만료 알림 생성, 읽음, 삭제, 중복 방지 확인
- [ ] QA 1~7: SQLD, GitHub/Notion, KB국민은행 지원건, 자소서, LOODI, 제출자료 연결 확인
- [ ] HTTPS: 운영 도메인, TLS 인증서, secure cookie, SameSite 설정 확인
- [ ] Backup: PostgreSQL volume/database 백업 및 복구 절차 확인

## Release Notes

- 운영 환경에서는 `.env`, `backend/.env` 대신 배포 환경의 Secret 관리 방식을 우선 사용한다.
- Google OAuth Redirect URI와 Google Calendar Redirect URI는 운영 backend 도메인 기준으로 Google Cloud Console에 등록한다.
- 업로드 파일 저장소는 공개 웹 루트가 아닌 영속 volume 또는 object storage를 사용한다.
- `docker compose down -v`는 로컬 DB와 업로드 파일 volume을 지우므로 릴리스 환경에서 사용하지 않는다.
