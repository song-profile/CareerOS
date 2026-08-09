"use client";

import dynamic from "next/dynamic";
import { CalendarSkeleton } from "@/features/calendar/components/calendar-states";
import type { CalendarBoardProps } from "@/features/calendar/components/calendar-board";

const DynamicCalendarBoard = dynamic<CalendarBoardProps>(
  () => import("@/features/calendar/components/calendar-board").then((mod) => mod.CalendarBoard),
  { loading: () => <CalendarSkeleton /> },
);

export function LazyCalendarBoard(props: CalendarBoardProps) {
  return <DynamicCalendarBoard {...props} />;
}
