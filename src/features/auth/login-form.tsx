"use client";

import { GoogleLoginButton } from "@/features/auth/google-login-button";

interface LoginFormProps {
  initialMessage?: string;
  initialServerError?: string;
}

export function LoginForm({ initialMessage = "", initialServerError = "" }: LoginFormProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <GoogleLoginButton />
        <p className="text-center text-caption text-neutral-600">
          처음 로그인하면 CareerDock 계정이 자동으로 생성됩니다.
        </p>
      </div>

      {initialServerError ? (
        <p className="rounded-control border border-danger-100 bg-danger-50 px-3 py-2 text-caption text-danger-700">
          {initialServerError}
        </p>
      ) : null}

      {initialMessage ? (
        <p className="rounded-control border border-primary-100 bg-primary-50 px-3 py-2 text-caption text-primary-700">
          {initialMessage}
        </p>
      ) : null}

      <p className="rounded-control border border-neutral-200 bg-neutral-50 px-3 py-2 text-caption text-neutral-600">
        CareerDock은 Google 계정으로만 로그인합니다.
      </p>
    </div>
  );
}
