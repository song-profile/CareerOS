import { Badge } from "@/components/ui/badge";
import type { MaterialFileType } from "@/features/materials/types";

interface MaterialFileTypeBadgeProps {
  type: MaterialFileType;
}

export function MaterialFileTypeBadge({ type }: MaterialFileTypeBadgeProps) {
  const variant = type === "포트폴리오" ? "primary" : type === "자격증" ? "success" : "neutral";

  return <Badge variant={variant}>{type}</Badge>;
}
