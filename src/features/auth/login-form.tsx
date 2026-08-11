"use client";

import { GoogleLoginButton } from "@/features/auth/google-login-button";

interface LoginFormProps {
  initialMessage?: string;
  initialServerError?: string;
}

export function LoginForm({ initialMessage = "", initialServerError = "" }: LoginFormProps) {
  return (
    <div className="grid gap-5">
      <GoogleLoginButton />

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
    </div>
  );
}
