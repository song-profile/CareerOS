"use client";

import dynamic from "next/dynamic";
import { MaterialFileListSkeleton } from "@/features/materials/components/materials-states";
import type { MaterialFileListProps } from "@/features/materials/components/material-file-list";

const DynamicMaterialFileList = dynamic<MaterialFileListProps>(
  () =>
    import("@/features/materials/components/material-file-list").then((mod) => mod.MaterialFileList),
  { loading: () => <MaterialFileListSkeleton /> },
);

export function LazyMaterialFileList(props: MaterialFileListProps) {
  return <DynamicMaterialFileList {...props} />;
}
