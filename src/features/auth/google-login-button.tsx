"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getGoogleOAuthStartUrl } from "@/features/auth/api/oauth-api";
import { ApiClientError } from "@/lib/api/client";

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [googleOAuthStartUrl, setGoogleOAuthStartUrl] = useState<string | null>(null);
  const disabled = !googleOAuthStartUrl || loading;

  useEffect(() => {
    setGoogleOAuthStartUrl(getGoogleOAuthStartUrl());
  }, []);

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
        leadingIcon={<GoogleLogo />}
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

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
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
