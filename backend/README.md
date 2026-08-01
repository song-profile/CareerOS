# CareerDock Backend

Spring Boot backend skeleton for CareerDock.

## Requirements

- Java 21
- Gradle 8.x or a generated Gradle Wrapper
- Docker Compose

## Local Environment

Create `backend/.env` locally if you want Docker Compose to use custom values.

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=careerdock
DB_USERNAME=careerdock
DB_PASSWORD=careerdock_dev_password
SERVER_PORT=8080
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax
```

Do not commit real secrets.

## PostgreSQL

```bash
cd backend
docker compose up -d postgres
```

## Run

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

If the Gradle Wrapper has not been generated yet, install Gradle locally and run:

```bash
gradle wrapper
```

## Health Check

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{"status":"UP"}
```

## Google OAuth

The backend owns the OAuth Authorization Code flow.

- Start URL: `GET /oauth2/authorization/google`
- Callback URL: `GET /login/oauth2/code/google`
- Current user: `GET /api/auth/me`
- Logout: `POST /api/auth/logout`

Local Google Console redirect URI:

```text
http://localhost:8080/login/oauth2/code/google
```
