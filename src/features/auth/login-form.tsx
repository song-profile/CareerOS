"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasFormErrors, type LoginFormErrors, type LoginFormValues, validateLoginForm } from "@/features/auth/validation";

const INITIAL_VALUES: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function focusFirstError(nextErrors: LoginFormErrors) {
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }

    if (nextErrors.password) {
      passwordRef.current?.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSuccessMessage("");
    setServerError("");

    const nextErrors = validateLoginForm(values);
    setErrors(nextErrors);

    if (hasFormErrors(nextErrors)) {
      focusFirstError(nextErrors);
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitting(false);
    setSuccessMessage("인증 API 연동 전입니다. 실제 로그인 처리는 다음 단계에서 연결됩니다.");
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <Input
          autoComplete="email"
          errorMessage={errors.email}
          label="이메일"
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          placeholder="name@example.com"
          ref={emailRef}
          required
          type="email"
          value={values.email}
        />
        <Input
          autoComplete="current-password"
          errorMessage={errors.password}
          label="비밀번호"
          onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
          placeholder="비밀번호"
          ref={passwordRef}
          required
          type="password"
          value={values.password}
        />
      </div>

      {serverError ? (
        <p className="rounded-control border border-danger-100 bg-danger-50 px-3 py-2 text-caption text-danger-700">
          {serverError}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-control border border-primary-100 bg-primary-50 px-3 py-2 text-caption text-primary-700">
          {successMessage}
        </p>
      ) : null}

      <Button className="w-full" loading={submitting} type="submit">
        로그인
      </Button>

      <div className="flex flex-col gap-2 text-center text-caption text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <Link className="text-primary-600 underline-offset-4 hover:underline" href="/signup">
          회원가입
        </Link>
        <span>비밀번호 찾기는 준비 중입니다.</span>
      </div>
    </form>
  );
}
