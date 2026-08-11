import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EssayVersionCompare } from "@/features/essays/components/essay-version-compare";
import type { EssayAnswerVersion } from "@/features/essays/version-types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function makeVersion(overrides: Partial<EssayAnswerVersion> = {}): EssayAnswerVersion {
  return {
    versionId: "v1",
    answerGroupId: "answer-1",
    questionId: "q1",
    versionNumber: 1,
    answerStatus: "작성본",
    content: "",
    characterCount: 0,
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
    submittedAt: null,
    parentVersionId: null,
    createdReason: "작성본 저장",
    isLocked: false,
    experienceTags: [],
    competencyTags: [],
    ...overrides,
  };
}

const CHANGED_BEFORE = "이 경험을 통해 협업의 중요성을 배웠습니다.";
const CHANGED_AFTER = "이 경험을 통해 협업과 갈등 조정의 중요성을 배웠습니다.";

const LEFT_CONTENT = [
  "저는 책임감을 최우선으로 생각합니다.",
  "이 문장은 다음 버전에서 사라집니다.",
  "협업을 통해 문제를 해결한 경험이 있습니다.",
  CHANGED_BEFORE,
  "앞으로도 계속 성장하겠습니다.",
].join("\n\n");

const RIGHT_CONTENT = [
  "저는 책임감을 최우선으로 생각합니다.",
  "협업을 통해 문제를 해결한 경험이 있습니다.",
  CHANGED_AFTER,
  "앞으로도 계속 성장하겠습니다.",
  "새로 추가한 문장입니다.",
].join("\n\n");

describe("EssayVersionCompare", () => {
  it("추가·삭제·수정·동일 문단을 데스크톱 좌우 비교와 모바일 Inline Diff에 함께 표시한다", () => {
    const left = makeVersion({
      versionId: "v1",
      versionNumber: 1,
      content: LEFT_CONTENT,
      characterCount: LEFT_CONTENT.length,
    });
    const right = makeVersion({
      versionId: "v2",
      versionNumber: 2,
      content: RIGHT_CONTENT,
      characterCount: RIGHT_CONTENT.length,
      answerStatus: "개선본",
    });

    render(
      <EssayVersionCompare
        answerGroupId="answer-1"
        left={left}
        right={right}
        versions={[left, right]}
      />,
    );

    expect(
      screen.getAllByText("협업을 통해 문제를 해결한 경험이 있습니다.").length,
    ).toBeGreaterThan(0);

    // 삭제된 문단: 데스크톱 왼쪽 열 라벨 + 모바일 Inline 라벨.
    expect(screen.getAllByText("이 문장은 다음 버전에서 사라집니다.").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/이 버전에만 있음/).length).toBeGreaterThan(0);
    expect(screen.getByText("− 삭제됨")).toBeInTheDocument();

    // 추가된 문단.
    expect(screen.getAllByText("새로 추가한 문장입니다.").length).toBeGreaterThan(0);
    expect(screen.getByText("+ 추가됨")).toBeInTheDocument();

    // 수정된 문단: 이전 텍스트와 새 텍스트가 함께 보인다.
    expect(screen.getAllByText(CHANGED_BEFORE).length).toBeGreaterThan(0);
    expect(screen.getAllByText(CHANGED_AFTER).length).toBeGreaterThan(0);
    expect(screen.getAllByText("± 수정됨").length).toBeGreaterThan(0);

    const delta = right.characterCount - left.characterCount;
    const deltaText = `${delta > 0 ? "+" : ""}${delta.toLocaleString("ko-KR")}자`;
    expect(screen.getByText(deltaText)).toBeInTheDocument();
  });

  it("같은 버전을 양쪽에 선택하면 경고 문구를 보여주고 내용을 수정하지 않는다", () => {
    const version = makeVersion({ versionId: "v1", content: "원본 내용입니다." });

    render(
      <EssayVersionCompare
        answerGroupId="answer-1"
        left={version}
        right={version}
        versions={[version]}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("같은 버전을 양쪽에 선택했습니다");
    expect(version.content).toBe("원본 내용입니다.");
  });
});
