import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardSummary } from "@/features/dashboard/dashboard-service";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [{ name: "JSESSIONID", value: "session-id" }],
  })),
}));

describe("getDashboardSummary", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
    vi.restoreAllMocks();
  });

  it("returns empty summary from API response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      summary: {
        weeklyDeadlineCount: 0,
        upcomingEventCount: 0,
        draftingApplicationCount: 0,
      },
      upcomingDeadlines: [],
      upcomingEvents: [],
    }), { status: 200, headers: { "content-type": "application/json" } })));

    const result = await getDashboardSummary();

    expect(result).toEqual({
      ok: true,
      value: {
        summary: {
          weeklyDeadlineCount: 0,
          upcomingEventCount: 0,
          draftingApplicationCount: 0,
        },
        upcomingDeadlines: [],
        upcomingEvents: [],
      },
    });
  });

  it("returns unauthorized message for 401", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 401 })));

    const result = await getDashboardSummary();

    expect(result).toMatchObject({
      ok: false,
      message: "로그인이 필요합니다. 다시 로그인해 주세요.",
      status: 401,
    });
  });

  it("returns server message for 500", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 500 })));

    const result = await getDashboardSummary();

    expect(result).toMatchObject({
      ok: false,
      message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      status: 500,
    });
  });

  it("returns network error message when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }));

    const result = await getDashboardSummary();

    expect(result).toEqual({
      ok: false,
      message: "네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
    });
  });
});
