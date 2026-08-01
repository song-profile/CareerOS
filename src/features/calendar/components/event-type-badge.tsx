import { Badge } from "@/components/ui/badge";
import { CALENDAR_EVENT_TYPE_LABEL } from "@/features/calendar/constants";
import type { CalendarEventType } from "@/features/calendar/types";

const eventTypeVariant: Record<
  CalendarEventType,
  "neutral" | "primary" | "success" | "danger" | "statusDraft" | "statusSubmitted" | "statusInterview"
> = {
  APPLICATION_DEADLINE: "danger",
  APTITUDE_TEST: "primary",
  NCS_TEST: "primary",
  TECHNICAL_TEST: "primary",
  CODING_TEST: "statusSubmitted",
  AI_ASSESSMENT: "statusDraft",
  ASSIGNMENT: "statusDraft",
  FIRST_INTERVIEW: "statusInterview",
  SECOND_INTERVIEW: "statusInterview",
  FINAL_INTERVIEW: "statusInterview",
  RESULT_ANNOUNCEMENT: "success",
  PERSONAL_PREPARATION: "neutral",
};

export function EventTypeBadge({ eventType }: { eventType: CalendarEventType }) {
  return <Badge variant={eventTypeVariant[eventType]}>{CALENDAR_EVENT_TYPE_LABEL[eventType]}</Badge>;
}
