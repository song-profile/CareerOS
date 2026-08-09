import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardSummary } from "@/features/dashboard/components/dashboard-summary";

describe("DashboardSummary", () => {
  it("renders dashboard summary counts", () => {
    render(
      <DashboardSummary
        summary={{
          draftingApplicationCount: 2,
          upcomingEventCount: 3,
          weeklyDeadlineCount: 1,
        }}
      />,
    );

    expect(screen.getByText("이번 주 마감")).toBeInTheDocument();
    expect(screen.getByText("다가오는 일정")).toBeInTheDocument();
    expect(screen.getByText("작성 중인 지원서")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
