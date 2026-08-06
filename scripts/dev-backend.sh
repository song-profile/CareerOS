#!/usr/bin/env bash
# backend/.env.local을 읽어 Spring Boot를 띄운다.
# Secret 값은 화면에 출력하지 않는다 — 존재 여부만 확인한다.
set -euo pipefail

cd "$(dirname "$0")/.."
ENV_FILE="backend/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "[dev-backend] $ENV_FILE 이 없다. backend/.env.example 을 참고해 만든다." >&2
  exit 1
fi

# set -a: 이 구간에서 정의되는 변수를 전부 export 해 gradlew 자식 프로세스로 넘긴다.
set -a
# shellcheck disable=SC1090
. "./$ENV_FILE"
set +a

missing=""
[ -n "${GOOGLE_CLIENT_ID:-}" ]     || missing="$missing GOOGLE_CLIENT_ID"
[ -n "${GOOGLE_CLIENT_SECRET:-}" ] || missing="$missing GOOGLE_CLIENT_SECRET"
if [ -n "$missing" ]; then
  echo "[dev-backend] $ENV_FILE 에 값이 비어 있다:$missing" >&2
  exit 1
fi

echo "[dev-backend] 환경변수 확인 완료. bootRun 시작."
cd backend
exec ./gradlew bootRun "$@"
