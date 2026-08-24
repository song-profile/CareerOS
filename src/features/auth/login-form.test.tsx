import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/login-form";

vi.mock("@/features/auth/api/oauth-api", () => ({
  getGoogleOAuthStartUrl: vi.fn(() => "http://localhost:8080/oauth2/authorization/google"),
}));

describe("LoginForm", () => {
  it("renders Google-only authentication copy", () => {
    render(<LoginForm />);

    expect(screen.getByRole("button", { name: "Google 계정으로 시작하기" })).toBeEnabled();
    expect(
      screen.queryByText("처음 시작해도 바로 쓸 수 있도록 Google 계정으로 워크스페이스를 만듭니다."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("CareerDock은 Google 계정으로만 로그인합니다.")).toBeInTheDocument();
    expect(screen.queryByLabelText("이메일")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("비밀번호")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "회원가입" })).not.toBeInTheDocument();
    expect(screen.queryByText("비밀번호 찾기는 준비 중입니다.")).not.toBeInTheDocument();
  });

  it("shows auth error message without adding fake email login", () => {
    render(<LoginForm initialServerError="로그인이 필요합니다." />);

    expect(screen.getByText("로그인이 필요합니다.")).toBeInTheDocument();
    expect(screen.queryByText("로그아웃되었습니다.")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("이메일")).not.toBeInTheDocument();
  });
});
