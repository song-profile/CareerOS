import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EssayVersionPanel } from "@/features/essays/components/essay-version-panel";
import type { EssayAnswerVersion } from "@/features/essays/version-types";

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

describe("EssayVersionPanel", () => {
  it("제출 이후 개선본이 있으면 제출본과 현재본 비교 CTA를 보여준다", () => {
    const submitted = makeVersion({
      versionId: "v1",
      versionNumber: 1,
      answerStatus: "제출본",
      isLocked: true,
    });
    const improved = makeVersion({ versionId: "v2", versionNumber: 2, answerStatus: "개선본" });

    render(
      <EssayVersionPanel
        answerGroupId="answer-1"
        onCreateClick={vi.fn()}
        onSelect={vi.fn()}
        selectedVersionId={improved.versionId}
        versions={[submitted, improved]}
      />,
    );

    expect(screen.getByRole("link", { name: "제출본과 현재본 비교" })).toHaveAttribute(
      "href",
      "/essays/answer-1/compare?left=v1&right=v2",
    );
  });

  it("제출본이 없으면 CTA를 보여주지 않는다", () => {
    const draft = makeVersion({ versionId: "v1", versionNumber: 1 });

    render(
      <EssayVersionPanel
        answerGroupId="answer-1"
        onCreateClick={vi.fn()}
        onSelect={vi.fn()}
        selectedVersionId={draft.versionId}
        versions={[draft]}
      />,
    );

    expect(screen.queryByRole("link", { name: "제출본과 현재본 비교" })).not.toBeInTheDocument();
  });

  it("제출본 자체가 최신 버전이면 비교할 현재본이 없어 CTA를 보여주지 않는다", () => {
    const submitted = makeVersion({
      versionId: "v1",
      versionNumber: 1,
      answerStatus: "제출본",
      isLocked: true,
    });

    render(
      <EssayVersionPanel
        answerGroupId="answer-1"
        onCreateClick={vi.fn()}
        onSelect={vi.fn()}
        selectedVersionId={submitted.versionId}
        versions={[submitted]}
      />,
    );

    expect(screen.queryByRole("link", { name: "제출본과 현재본 비교" })).not.toBeInTheDocument();
  });
});
