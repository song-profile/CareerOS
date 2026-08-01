import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EssayEditor } from "@/features/essays/components/essay-editor";
import { getEssayAnswer } from "@/features/essays/editor-service";

/** 같은 요청 안에서 generateMetadata와 페이지가 조회를 공유한다. */
const loadAnswer = cache(getEssayAnswer);

interface EssayEditorPageProps {
  params: Promise<{
    answerId: string;
  }>;
}

export async function generateMetadata({ params }: EssayEditorPageProps): Promise<Metadata> {
  const { answerId } = await params;
  const answer = await loadAnswer(answerId);

  if (!answer) {
    return { title: "답변을 찾을 수 없음" };
  }

  return {
    title: `${answer.question.companyName} ${answer.question.positionName} 자소서`,
  };
}

export default async function EssayEditorPage({ params }: EssayEditorPageProps) {
  const { answerId } = await params;
  const answer = await loadAnswer(answerId);

  // notFound()는 not-found.tsx를 렌더링한다.
  // 다만 같은 세그먼트의 loading.tsx가 스트리밍을 시작시키므로 응답 상태는 200으로 남는다.
  // 화면과 복구 링크는 정상 동작하며, 404 상태가 필요해지면 loading.tsx를 제거해야 한다.
  if (!answer) {
    notFound();
  }

  return (
    <>
      <PageHeader
        description="문항을 확인하면서 답변을 작성하고 임시 저장하거나 제출본으로 잠글 수 있습니다."
        title="자소서 작성"
      />
      <EssayEditor answer={answer} />
    </>
  );
}
