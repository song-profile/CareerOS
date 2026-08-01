import { Card, CardContent } from "@/components/ui/card";
import { CharacterCounter } from "@/features/essays/components/character-counter";

interface ReadOnlyEssayAnswerProps {
  content: string;
  characterCount: number;
  characterLimit: number | null;
}

/**
 * 제출본은 disabled textarea 대신 읽기 좋은 본문 영역으로 보여준다.
 * disabled 입력은 대비가 낮고 스크린 리더가 건너뛰는 경우가 있다.
 */
export function ReadOnlyEssayAnswer({
  characterCount,
  characterLimit,
  content,
}: ReadOnlyEssayAnswerProps) {
  return (
    <div className="grid gap-2">
      <p className="text-body-medium text-neutral-900">제출한 답변</p>
      <Card className="bg-neutral-50">
        <CardContent>
          <div className="whitespace-pre-wrap text-body text-neutral-900">{content}</div>
        </CardContent>
      </Card>
      <CharacterCounter count={characterCount} limit={characterLimit} />
    </div>
  );
}
