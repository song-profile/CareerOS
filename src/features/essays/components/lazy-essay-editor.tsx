"use client";

import dynamic from "next/dynamic";
import { EssayEditorSkeleton } from "@/features/essays/components/essay-editor-states";
import type { EssayEditorProps } from "@/features/essays/components/essay-editor";

const DynamicEssayEditor = dynamic<EssayEditorProps>(
  () => import("@/features/essays/components/essay-editor").then((mod) => mod.EssayEditor),
  { loading: () => <EssayEditorSkeleton /> },
);

export function LazyEssayEditor(props: EssayEditorProps) {
  return <DynamicEssayEditor {...props} />;
}
