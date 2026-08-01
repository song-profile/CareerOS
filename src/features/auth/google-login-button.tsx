"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getGoogleOAuthStartUrl } from "@/features/auth/api/oauth-api";
import { ApiClientError } from "@/lib/api/client";

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const googleOAuthStartUrl = getGoogleOAuthStartUrl();
  const disabled = !googleOAuthStartUrl || loading;

  function handleGoogleLogin() {
    if (!googleOAuthStartUrl || loading) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    window.location.assign(googleOAuthStartUrl);
  }

  return (
    <div className="grid gap-2">
      <Button
        aria-label="Google로 계속하기"
        className="w-full"
        disabled={disabled}
        loading={loading}
        onClick={handleGoogleLogin}
        type="button"
        variant="secondary"
      >
        Google로 계속하기
      </Button>
      {!googleOAuthStartUrl ? (
        <p className="text-caption text-neutral-600">
          백엔드 Google OAuth 시작 URL이 확인되면 활성화됩니다.
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-control border border-danger-100 bg-danger-50 px-3 py-2 text-caption text-danger-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export function getGoogleLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.kind === "network") {
      return "인증 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    }

    if (error.kind === "unauthorized") {
      return "Google 인증이 완료되지 않았습니다. 다시 로그인해 주세요.";
    }

    return error.message;
  }

  return "Google 로그인을 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.";
}
