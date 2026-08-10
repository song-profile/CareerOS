import { describe, expect, it, vi } from "vitest";
import SignupPage from "@/app/(auth)/signup/page";
import { redirect } from "next/navigation";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

describe("SignupPage", () => {
  it("redirects to the Google-only login page", () => {
    expect(() => SignupPage()).toThrow("redirect:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
