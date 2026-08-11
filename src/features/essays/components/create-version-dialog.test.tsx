import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateVersionDialog } from "@/features/essays/components/create-version-dialog";
import type { EssayAnswerVersion } from "@/features/essays/version-types";

function makeVersion(overrides: Partial<EssayAnswerVersion> = {}): EssayAnswerVersion {
  return {
    versionId: "v1",
    answerGroupId: "answer-1",
    questionId: "q1",
    versionNumber: 1,
    answerStatus: "제출본",
    content: "제출한 내용",
    characterCount: 6,
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
    submittedAt: new Date("2026-08-01T00:00:00Z"),
    parentVersionId: null,
    createdReason: "제출본 저장",
    isLocked: true,
    experienceTags: ["LOODI"],
    competencyTags: [],
    ...overrides,
  };
}

describe("CreateVersionDialog", () => {
  /**
   * 백엔드의 새 버전 API는 본문만 받는다. 저장할 곳이 없는 값을 입력받으면
   * 사용자가 적은 내용이 조용히 사라진다.
   */
  it("서버가 저장하지 않는 생성 이유는 입력받지 않는다", () => {
    render(
      <CreateVersionDialog
        baseVersion={makeVersion()}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        open
        saving={false}
      />,
    );

    expect(screen.queryByLabelText(/생성 이유/)).not.toBeInTheDocument();
  });

  /** 경험 태그는 답변 버전이 소유하므로 새 버전으로 따라오지 않는다. */
  it("경험 태그가 새 버전으로 복사되지 않는다고 안내한다", () => {
    render(
      <CreateVersionDialog
        baseVersion={makeVersion()}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        open
        saving={false}
      />,
    );

    expect(screen.getByText(/경험 태그는 버전마다 따로 남으므로/)).toBeInTheDocument();
  });

  it("본문 복사 여부만 담아 생성 요청을 전달한다", async () => {
    const onConfirm = vi.fn();
    render(
      <CreateVersionDialog
        baseVersion={makeVersion()}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
        open
        saving={false}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "개선본 만들기" }));

    expect(onConfirm).toHaveBeenCalledWith({ copyContent: true });
  });
});
