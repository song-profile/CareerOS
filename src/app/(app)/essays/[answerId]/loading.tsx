import { PageHeader } from "@/components/layout/page-header";
import { EssayEditorSkeleton } from "@/features/essays/components/essay-editor-states";

export default function EssayEditorLoading() {
  return (
    <>
      <PageHeader
        description="문항을 확인하면서 답변을 작성하고 임시 저장하거나 제출본으로 잠글 수 있습니다."
        title="자소서 작성"
      />
      <EssayEditorSkeleton />
    </>
  );
}
