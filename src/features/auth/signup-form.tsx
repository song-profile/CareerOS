"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleLoginButton } from "@/features/auth/google-login-button";
import { hasFormErrors, type SignupFormErrors, type SignupFormValues, validateSignupForm } from "@/features/auth/validation";

const INITIAL_VALUES: SignupFormValues = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
};

export function SignupForm() {
  const [values, setValues] = useState<SignupFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);

  function focusFirstError(nextErrors: SignupFormErrors) {
    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }

    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }

    if (nextErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    if (nextErrors.passwordConfirm) {
      passwordConfirmRef.current?.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSuccessMessage("");
    setServerError("");

    const nextErrors = validateSignupForm(values);
    setErrors(nextErrors);

    if (hasFormErrors(nextErrors)) {
      focusFirstError(nextErrors);
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitting(false);
    setSuccessMessage("인증 API 연동 전입니다. 실제 계정 생성은 다음 단계에서 연결됩니다.");
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      <GoogleLoginButton />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-neutral-200" />
        <span className="text-caption text-neutral-400">또는</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <div className="grid gap-4">
        <Input
          autoComplete="name"
          errorMessage={errors.name}
          label="이름"
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          placeholder="이름"
          ref={nameRef}
          required
          value={values.name}
        />
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
          autoComplete="new-password"
          errorMessage={errors.password}
          helperText="비밀번호는 8자 이상이면 충분합니다."
          label="비밀번호"
          onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
          placeholder="비밀번호"
          ref={passwordRef}
          required
          type="password"
          value={values.password}
        />
        <Input
          autoComplete="new-password"
          errorMessage={errors.passwordConfirm}
          label="비밀번호 확인"
          onChange={(event) =>
            setValues((current) => ({ ...current, passwordConfirm: event.target.value }))
          }
          placeholder="비밀번호 확인"
          ref={passwordConfirmRef}
          required
          type="password"
          value={values.passwordConfirm}
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
        회원가입
      </Button>

      <p className="text-center text-caption text-neutral-600">
        이미 계정이 있나요?{" "}
        <Link className="text-primary-600 underline-offset-4 hover:underline" href="/login">
          로그인
        </Link>
      </p>
    </form>
  );
}
