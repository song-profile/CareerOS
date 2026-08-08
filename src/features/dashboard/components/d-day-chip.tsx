import { Badge } from "@/components/ui/badge";
import { getDDayLabel, getDeadlineTone } from "@/features/dashboard/date-utils";
import type { DeadlineTone } from "@/features/dashboard/date-utils";

const toneVariant: Record<
  DeadlineTone,
  "deadlineUrgent" | "deadlineSoon" | "deadlineWeek" | "deadlineUpcoming" | "neutral"
> = {
  urgent: "deadlineUrgent",
  soon: "deadlineSoon",
  week: "deadlineWeek",
  calm: "deadlineUpcoming",
  ended: "neutral",
};

interface DDayChipProps {
  daysUntil: number;
}

export function DDayChip({ daysUntil }: DDayChipProps) {
  const tone = getDeadlineTone(daysUntil);

  return <Badge variant={toneVariant[tone]}>{getDDayLabel(daysUntil)}</Badge>;
}
