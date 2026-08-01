import { Badge } from "@/components/ui/badge";
import type { ExternalLinkType } from "@/features/materials/types";

interface ExternalLinkTypeBadgeProps {
  type: ExternalLinkType;
}

export function ExternalLinkTypeBadge({ type }: ExternalLinkTypeBadgeProps) {
  const variant = type === "GitHub" || type === "Portfolio" ? "primary" : "neutral";

  return <Badge variant={variant}>{type}</Badge>;
}
