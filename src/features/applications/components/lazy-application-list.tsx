"use client";

import dynamic from "next/dynamic";
import { ApplicationLoadingState } from "@/features/applications/components/application-list-states";
import type { ApplicationListProps } from "@/features/applications/components/application-list";

const DynamicApplicationList = dynamic<ApplicationListProps>(
  () => import("@/features/applications/components/application-list").then((mod) => mod.ApplicationList),
  { loading: () => <ApplicationLoadingState /> },
);

export function LazyApplicationList(props: ApplicationListProps) {
  return <DynamicApplicationList {...props} />;
}
