import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCalendarEvent, getCalendarEvents } from "@/features/calendar/calendar-service";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: () => [{ name: "JSESSIONID", value: "session-id" }],
  })),
}));

describe("calendar-service", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";
    vi.restoreAllMocks();
  });

  it("returns calendar events from API", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify([
      {
        id: 1,
        applicationId: null,
        companyName: null,
        positionName: null,
        eventType: "PERSONAL_PREPARATION",
        title: "면접 준비",
        startAt: "2026-08-08T01:00:00Z",
        endAt: "2026-08-08T02:00:00Z",
        allDay: false,
        location: null,
        onlineUrl: null,
        memo: null,
        syncStatus: "NOT_CONNECTED",
        googleEventId: null,
        reminderRules: [],
        createdAt: "2026-08-08T00:00:00Z",
        updatedAt: "2026-08-08T00:00:00Z",
      },
    ]), { status: 200, headers: { "content-type": "application/json" } })));

    const result = await getCalendarEvents();

    expect(result.ok).toBe(true);
    expect(result.ok && result.value[0].title).toBe("면접 준비");
  });

  it("returns not found message for 404", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 404 })));

    const result = await getCalendarEvent("missing");

    expect(result).toMatchObject({
      ok: false,
      message: "요청한 정보를 찾을 수 없습니다.",
      status: 404,
    });
  });

  it("returns network error message when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }));

    const result = await getCalendarEvents();

    expect(result).toEqual({
      ok: false,
      message: "네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
    });
  });
});
