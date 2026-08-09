import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleCalendarSettings } from "@/features/calendar/components/google-calendar-settings";
import {
  connectGoogleCalendar,
  fetchGoogleCalendarStatus,
} from "@/features/calendar/api/calendar-api";

vi.mock("@/features/calendar/api/calendar-api", () => ({
  connectGoogleCalendar: vi.fn(),
  createGoogleCalendarTestEvent: vi.fn(),
  disconnectGoogleCalendar: vi.fn(),
  fetchGoogleCalendarStatus: vi.fn(),
  syncGoogleCalendar: vi.fn(),
}));

describe("GoogleCalendarSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");
    vi.mocked(fetchGoogleCalendarStatus).mockResolvedValue({
      connected: false,
      connectedAt: null,
      eventCounts: {},
      lastSyncError: null,
      lastSyncedAt: null,
      status: "NOT_CONNECTED",
    });
  });

  it("loads Google Calendar connection status", async () => {
    render(<GoogleCalendarSettings />);

    expect(await screen.findByText("연결되지 않음")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Calendar 연결" })).toBeEnabled();
  });

  it("starts separate Google Calendar consent only when connect button is clicked", async () => {
    const user = userEvent.setup();
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });
    vi.mocked(connectGoogleCalendar).mockResolvedValue({
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth?scope=calendar",
    });

    render(<GoogleCalendarSettings />);

    await user.click(await screen.findByRole("button", { name: "Calendar 연결" }));

    await waitFor(() => {
      expect(connectGoogleCalendar).toHaveBeenCalledTimes(1);
      expect(assign).toHaveBeenCalledWith("https://accounts.google.com/o/oauth2/v2/auth?scope=calendar");
    });
  });
});
