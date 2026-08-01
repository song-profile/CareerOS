import {
  getCharacterCountLevel,
  getOverflowCount,
} from "@/features/essays/character-count";
import { cn } from "@/lib/utils/cn";

const levelClassName = {
  normal: "text-neutral-600",
  warning: "text-urgent-amber",
  over: "text-danger-600",
} as const;

interface CharacterCounterProps {
  count: number;
  limit: number | null;
  id?: string;
}

/**
 * 색만으로 초과 여부를 전달하지 않도록 상태를 항상 텍스트로 함께 적는다.
 * 입력 중 레이아웃이 흔들리지 않게 높이를 고정한다.
 */
export function CharacterCounter({ count, id, limit }: CharacterCounterProps) {
  const level = getCharacterCountLevel(count, limit);
  const overflow = getOverflowCount(count, limit);

  return (
    <div className="flex min-h-9 flex-wrap items-center justify-between gap-2" id={id}>
      <span className={cn("font-mono text-mono", levelClassName[level])}>
        {count.toLocaleString("ko-KR")}
        {limit === null ? "자" : ` / ${limit.toLocaleString("ko-KR")}자`}
      </span>
      <span className={cn("text-caption", levelClassName[level])}>
        {limit === null ? "제한 없음 · 공백 포함" : null}
        {limit !== null && level === "over"
          ? `제한 ${overflow.toLocaleString("ko-KR")}자 초과 · 제출본으로 저장할 수 없습니다`
          : null}
        {limit !== null && level === "warning" ? "제한에 근접했습니다 · 공백 포함" : null}
        {limit !== null && level === "normal" ? "공백 포함 기준" : null}
      </span>
    </div>
  );
}
