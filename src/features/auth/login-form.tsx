"use client";

import { GoogleLoginButton } from "@/features/auth/google-login-button";

interface LoginFormProps {
  initialServerError?: string;
}

export function LoginForm({ initialServerError = "" }: LoginFormProps) {
  return (
    <div className="grid gap-5">
      <GoogleLoginButton />

      {initialServerError ? (
        <p className="rounded-control border border-danger-100 bg-danger-50 px-3 py-2 text-caption text-danger-700">
          {initialServerError}
        </p>
      ) : null}

      <p className="rounded-control border border-neutral-200/80 bg-neutral-50/70 px-3 py-2 text-caption text-neutral-600">
        CareerDock은 Google 계정으로만 로그인합니다.
      </p>
    </div>
  );
}
