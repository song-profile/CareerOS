import { PageHeader } from "@/components/layout/page-header";
import { EssayEditorNotFoundState } from "@/features/essays/components/essay-editor-states";

export default function EssayEditorNotFound() {
  return (
    <>
      <PageHeader description="요청한 자소서 답변이 없습니다." title="자소서 작성" />
      <EssayEditorNotFoundState />
    </>
  );
}
