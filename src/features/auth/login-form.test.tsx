import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/login-form";

vi.mock("@/features/auth/api/oauth-api", () => ({
  getGoogleOAuthStartUrl: vi.fn(() => "http://localhost:8080/oauth2/authorization/google"),
}));

describe("LoginForm", () => {
  it("renders Google authentication without extra login method copy", () => {
    render(<LoginForm />);

    expect(screen.getByRole("button", { name: "Google 계정으로 시작하기" })).toBeEnabled();
    expect(screen.queryByText("처음 로그인하면 CareerDock 계정이 자동으로 생성됩니다.")).not.toBeInTheDocument();
    expect(screen.queryByText("CareerDock은 Google 계정으로만 로그인합니다.")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("이메일")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("비밀번호")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "회원가입" })).not.toBeInTheDocument();
    expect(screen.queryByText("비밀번호 찾기는 준비 중입니다.")).not.toBeInTheDocument();
  });

  it("shows logout and auth error messages without adding fake email login", () => {
    render(<LoginForm initialMessage="로그아웃되었습니다." initialServerError="로그인이 필요합니다." />);

    expect(screen.getByText("로그아웃되었습니다.")).toBeInTheDocument();
    expect(screen.getByText("로그인이 필요합니다.")).toBeInTheDocument();
    expect(screen.queryByLabelText("이메일")).not.toBeInTheDocument();
  });
});
