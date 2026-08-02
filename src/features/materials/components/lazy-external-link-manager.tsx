"use client";

import dynamic from "next/dynamic";
import { ExternalLinkListSkeleton } from "@/features/materials/components/materials-states";
import type { ExternalLinkManagerProps } from "@/features/materials/components/external-link-manager";

const DynamicExternalLinkManager = dynamic<ExternalLinkManagerProps>(
  () =>
    import("@/features/materials/components/external-link-manager").then(
      (mod) => mod.ExternalLinkManager,
    ),
  { loading: () => <ExternalLinkListSkeleton /> },
);

export function LazyExternalLinkManager(props: ExternalLinkManagerProps) {
  return <DynamicExternalLinkManager {...props} />;
}
