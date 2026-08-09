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
DB_PASSWORD=replace-with-local-db-password
SERVER_PORT=8080
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax
FILE_STORAGE_PATH=./data/files
MAX_UPLOAD_SIZE=10MB
MAX_UPLOAD_REQUEST_SIZE=11MB
```

Do not commit real secrets.

## File storage

Uploaded file bodies are written under `FILE_STORAGE_PATH`, not into the
database. The default `./data/files` is git-ignored.

The path must not sit under a public web root. Downloads always go through
`GET /api/files/{id}/download`, which checks the owner and returns the body as
an attachment. There is no public URL for an uploaded file, and the storage key
is never exposed in an API response.

In production, mount that path to a volume that outlives the container. Point
it at object storage later by adding one more `FileStorage` implementation; no
other code changes.

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

## Test

```bash
cd backend
./gradlew test
```

Tests run against a real PostgreSQL via Testcontainers, so Docker must be running.

### Cleaning up between tests

All test classes share one PostgreSQL container. Each test class must reset the
database with a single statement:

```java
jdbcTemplate.execute("TRUNCATE TABLE users CASCADE");
```

Do **not** call `userRepository.deleteAll()` after deleting only your own
feature's tables. Rows another test class left behind still reference `users`,
so the delete fails with a foreign key violation — and adding a new feature
breaks every existing test class. `CASCADE` follows the references to `users`,
so this line never needs updating when a feature is added.

### Colima users

If Docker runs through Colima instead of Docker Desktop, the socket is not at
`/var/run/docker.sock` and Testcontainers cannot find it. Three settings are
needed, none of which belong in this repository:

`~/.testcontainers.properties`

```properties
docker.host=unix:///Users/<you>/.colima/default/docker.sock
```

`~/.docker-java.properties` — Docker Engine 29+ rejects API versions below 1.40,
but docker-java defaults to 1.32. This key cannot be set through an environment
variable because of the dot in its name.

```properties
api.version=1.44
```

`~/.zshrc` — Ryuk bind-mounts the Docker socket into a container. It must be
given the path as seen from inside the VM, and this one is read *only* from the
environment.

```bash
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
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
