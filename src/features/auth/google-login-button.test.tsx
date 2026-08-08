import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleLoginButton } from "@/features/auth/google-login-button";
import { getGoogleOAuthStartUrl } from "@/features/auth/api/oauth-api";

vi.mock("@/features/auth/api/oauth-api", () => ({
  getGoogleOAuthStartUrl: vi.fn(),
}));

describe("GoogleLoginButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stays disabled until Google OAuth start URL is available", async () => {
    vi.mocked(getGoogleOAuthStartUrl).mockReturnValue(null);

    render(<GoogleLoginButton />);

    const button = screen.getByRole("button", { name: "Google로 계속하기" });
    await waitFor(() => expect(button).toBeDisabled());
    expect(screen.getByText("백엔드 Google OAuth 시작 URL이 확인되면 활성화됩니다.")).toBeInTheDocument();
  });

  it("disables duplicate submit while redirecting to Google", async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    vi.mocked(getGoogleOAuthStartUrl).mockReturnValue("http://localhost:8080/oauth2/authorization/google");
    vi.stubGlobal("location", { assign });

    render(<GoogleLoginButton />);

    const button = await screen.findByRole("button", { name: "Google로 계속하기" });
    await user.click(button);

    expect(assign).toHaveBeenCalledWith("http://localhost:8080/oauth2/authorization/google");
    expect(button).toBeDisabled();
  });
});
