# CareerOS

CareerDock frontend built with Next.js App Router, TypeScript, and Tailwind CSS.

## Environment

Create `.env.local` locally when connecting to the Spring Boot API.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_OAUTH_START_PATH=/oauth2/authorization/google
```

Do not commit `.env.local` or real secrets.

The frontend API client uses Spring Security Session cookies, so requests are sent with
`credentials: "include"`. Do not store Google tokens or JWTs in browser storage.

## Backend

Spring Boot backend skeleton is under `backend/`.

```bash
cd backend
docker compose up -d postgres
./gradlew bootRun --args='--spring.profiles.active=local'
```

Health check:

```bash
curl http://localhost:8080/api/health
```

Google OAuth local callback:

```text
http://localhost:8080/login/oauth2/code/google
```
