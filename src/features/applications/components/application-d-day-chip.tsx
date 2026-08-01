import { Badge } from "@/components/ui/badge";
import {
  getDDayLabel,
  getDaysUntil,
  getDeadlineTone,
} from "@/features/applications/date-utils";
import type { ApplicationDeadlineTone } from "@/features/applications/date-utils";

const toneVariant: Record<
  ApplicationDeadlineTone,
  "deadlineUrgent" | "deadlineSoon" | "deadlineWeek" | "deadlineUpcoming" | "neutral"
> = {
  urgent: "deadlineUrgent",
  soon: "deadlineSoon",
  week: "deadlineWeek",
  calm: "deadlineUpcoming",
  ended: "neutral",
};

interface ApplicationDDayChipProps {
  deadline: Date;
}

export function ApplicationDDayChip({ deadline }: ApplicationDDayChipProps) {
  const daysUntil = getDaysUntil(deadline);
  const tone = getDeadlineTone(daysUntil);

  return <Badge variant={toneVariant[tone]}>{getDDayLabel(daysUntil)}</Badge>;
}
