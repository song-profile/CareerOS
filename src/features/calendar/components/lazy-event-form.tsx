"use client";

import dynamic from "next/dynamic";
import { EventFormSkeleton } from "@/features/calendar/components/calendar-states";
import type { EventFormProps } from "@/features/calendar/components/event-form";

const DynamicEventForm = dynamic<EventFormProps>(
  () => import("@/features/calendar/components/event-form").then((mod) => mod.EventForm),
  { loading: () => <EventFormSkeleton /> },
);

export function LazyEventForm(props: EventFormProps) {
  return <DynamicEventForm {...props} />;
}
