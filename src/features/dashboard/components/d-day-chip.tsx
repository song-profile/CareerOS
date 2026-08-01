import { Badge } from "@/components/ui/badge";
import { getDDayLabel, getDaysUntil, getDeadlineTone } from "@/features/dashboard/date-utils";
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
  date: Date;
}

export function DDayChip({ date }: DDayChipProps) {
  const daysUntil = getDaysUntil(date);
  const tone = getDeadlineTone(daysUntil);

  return <Badge variant={toneVariant[tone]}>{getDDayLabel(daysUntil)}</Badge>;
}
