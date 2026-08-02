"use client";

import Link from "next/link";
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

      <p className="rounded-control border border-neutral-200 bg-neutral-50 px-3 py-2 text-caption text-neutral-600">
        이메일·비밀번호 로그인은 준비 중입니다. 현재는 Google OAuth로만 로그인합니다.
      </p>

      <div className="flex flex-col gap-2 text-center text-caption text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <Link className="text-primary-600 underline-offset-4 hover:underline" href="/signup">
          회원가입
        </Link>
        <span>비밀번호 찾기는 준비 중입니다.</span>
      </div>
    </div>
  );
}
