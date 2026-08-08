import { describe, expect, it } from "vitest";
import { createHttpError, createNetworkError } from "@/lib/api/errors";
import { getApiClientErrorMessage, getServerResultErrorMessage } from "@/lib/api/error-message";

describe("ApiClientError", () => {
  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "notFound"],
    [409, "conflict"],
    [422, "validation"],
    [500, "server"],
  ] as const)("maps HTTP %i to %s", (status, kind) => {
    const error = createHttpError(status, { message: "" });

    expect(error.kind).toBe(kind);
  });

  it("normalizes field errors from backend payload", () => {
    const error = createHttpError(400, {
      message: "입력값을 확인해 주세요.",
      fieldErrors: { title: "제목을 입력해 주세요." },
    });

    expect(error.kind).toBe("validation");
    expect(error.fieldErrors).toEqual({ title: "제목을 입력해 주세요." });
  });

  it("returns network-specific user message", () => {
    const error = createNetworkError("");

    expect(getApiClientErrorMessage(error, "fallback")).toBe("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
  });

  it("returns status-specific server result messages", () => {
    expect(getServerResultErrorMessage(401, "fallback")).toContain("로그인이 필요");
    expect(getServerResultErrorMessage(404, "fallback")).toContain("찾을 수 없습니다");
    expect(getServerResultErrorMessage(500, "fallback")).toContain("서버 오류");
  });
});
