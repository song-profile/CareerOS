import { describe, expect, it } from "vitest";
import {
  compareParagraphs,
  diffEssayParagraphs,
  getDefaultComparePair,
  getSubmittedComparePair,
  resolveVersionOrDefault,
} from "@/features/essays/version-utils";
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

describe("diffEssayParagraphs", () => {
  it("동일한 문장은 모두 same으로 표시한다", () => {
    const content = "첫 번째 문단입니다.\n\n두 번째 문단입니다.";

    expect(diffEssayParagraphs(content, content)).toEqual([
      { change: "same", text: "첫 번째 문단입니다." },
      { change: "same", text: "두 번째 문단입니다." },
    ]);
  });

  it("문단이 추가되면 added로 표시한다", () => {
    const left = "지원 동기입니다.";
    const right = "지원 동기입니다.\n\n추가로 쓴 문단입니다.";

    expect(diffEssayParagraphs(left, right)).toEqual([
      { change: "same", text: "지원 동기입니다." },
      { change: "added", text: "추가로 쓴 문단입니다." },
    ]);
  });

  it("문단이 삭제되면 removed로 표시한다", () => {
    const left = "지원 동기입니다.\n\n삭제될 문단입니다.";
    const right = "지원 동기입니다.";

    expect(diffEssayParagraphs(left, right)).toEqual([
      { change: "same", text: "지원 동기입니다." },
      { change: "removed", text: "삭제될 문단입니다." },
    ]);
  });

  it("문단 내용이 바뀌면 changed로 이전/이후 텍스트를 함께 짝짓는다", () => {
    const left = "저는 책임감이 강합니다.";
    const right = "저는 책임감과 협업 능력이 강합니다.";

    expect(diffEssayParagraphs(left, right)).toEqual([
      {
        change: "changed",
        text: "저는 책임감이 강합니다.",
        nextText: "저는 책임감과 협업 능력이 강합니다.",
      },
    ]);
  });

  it("양쪽 다 완전히 빈 문장이면 비교할 문단이 없다", () => {
    expect(diffEssayParagraphs("", "")).toEqual([]);
    expect(diffEssayParagraphs("   \n\n  ", "")).toEqual([]);
  });

  it("한쪽만 빈 문장이면 나머지 전체가 추가 또는 삭제로 표시된다", () => {
    const content = "처음 쓴 답변입니다.";

    expect(diffEssayParagraphs("", content)).toEqual([{ change: "added", text: content }]);
    expect(diffEssayParagraphs(content, "")).toEqual([{ change: "removed", text: content }]);
  });

  it("문단 안의 줄바꿈은 하나의 문단으로 유지된 채 비교된다", () => {
    const left = "첫째 줄\n둘째 줄";
    const right = "첫째 줄\n둘째 줄 수정";

    expect(diffEssayParagraphs(left, right)).toEqual([
      { change: "changed", text: "첫째 줄\n둘째 줄", nextText: "첫째 줄\n둘째 줄 수정" },
    ]);
  });

  it("빈 줄로 구분된 문단은 서로 다른 문단으로 취급한다", () => {
    const content = "첫 문단\n\n둘째 문단";

    expect(diffEssayParagraphs(content, content)).toHaveLength(2);
  });

  it("서로 무관한 문단이 같은 자리에서 바뀌면 수정이 아니라 삭제와 추가로 나눈다", () => {
    const left = "동아리에서 회계를 맡아 예산을 관리했습니다.";
    const right = "주말마다 등산을 다니며 체력을 길렀습니다.";

    expect(diffEssayParagraphs(left, right)).toEqual([
      { change: "removed", text: left },
      { change: "added", text: right },
    ]);
  });

  it("한 덩어리 안에서 순서가 어긋나도 실제로 닮은 문단끼리 수정으로 짝짓는다", () => {
    const left = ["완전히 사라질 문단입니다.", "저는 책임감이 강합니다."].join("\n\n");
    const right = "저는 책임감과 협업 능력이 모두 강합니다.";

    // 순서대로 짝지으면 "완전히 사라질 문단"과 새 문단이 수정으로 묶인다.
    expect(diffEssayParagraphs(left, right)).toEqual([
      { change: "removed", text: "완전히 사라질 문단입니다." },
      {
        change: "changed",
        text: "저는 책임감이 강합니다.",
        nextText: "저는 책임감과 협업 능력이 모두 강합니다.",
      },
    ]);
  });

  it("하나의 추가 문단이 두 삭제 문단에 중복으로 짝지어지지 않는다", () => {
    const left = ["저는 책임감이 강합니다.", "저는 책임감이 강합니다. 정말로."].join("\n\n");
    const right = "저는 책임감이 아주 강합니다.";

    const blocks = diffEssayParagraphs(left, right);

    expect(blocks.filter((block) => block.change === "changed")).toHaveLength(1);
    expect(blocks.filter((block) => block.change === "removed")).toHaveLength(1);
    expect(blocks.filter((block) => block.change === "added")).toHaveLength(0);
  });

  it("긴 자소서에서도 가운데 문단 하나의 수정만 정확히 잡아낸다", () => {
    const paragraphs = Array.from({ length: 30 }, (_, index) => `${index + 1}번째 문단입니다.`);
    const left = paragraphs.join("\n\n");
    const modified = [...paragraphs];
    modified[15] = "16번째 문단을 수정했습니다.";
    const right = modified.join("\n\n");

    const blocks = diffEssayParagraphs(left, right);

    expect(blocks).toHaveLength(30);
    expect(blocks.filter((block) => block.change !== "same")).toEqual([
      { change: "changed", text: "16번째 문단입니다.", nextText: "16번째 문단을 수정했습니다." },
    ]);
  });
});

describe("compareParagraphs", () => {
  it("좌우 목록으로 나눌 때 changed 문단은 각자 자기 쪽 텍스트만 갖는다", () => {
    const result = compareParagraphs("이전 문단입니다.", "수정된 문단입니다.");

    expect(result.left).toEqual([{ change: "changed", text: "이전 문단입니다." }]);
    expect(result.right).toEqual([{ change: "changed", text: "수정된 문단입니다." }]);
  });
});

describe("getDefaultComparePair", () => {
  it("버전이 하나뿐이면 비교할 대상이 없다", () => {
    expect(getDefaultComparePair([makeVersion({ versionId: "v1", versionNumber: 1 })])).toBeNull();
  });

  it("직전 버전과 최신 버전을 기본값으로 짝짓는다", () => {
    const v1 = makeVersion({ versionId: "v1", versionNumber: 1 });
    const v2 = makeVersion({ versionId: "v2", versionNumber: 2 });

    expect(getDefaultComparePair([v1, v2])).toEqual({ left: v1, right: v2 });
  });
});

describe("getSubmittedComparePair", () => {
  it("제출본이 없으면 null이다", () => {
    const versions = [makeVersion({ versionId: "v1", versionNumber: 1 })];

    expect(getSubmittedComparePair(versions)).toBeNull();
  });

  it("제출본 자체가 최신 버전이면 비교할 대상이 없다", () => {
    const submitted = makeVersion({
      versionId: "v1",
      versionNumber: 1,
      answerStatus: "제출본",
      isLocked: true,
    });

    expect(getSubmittedComparePair([submitted])).toBeNull();
  });

  it("제출 이후 개선본을 만들었으면 제출본과 최신 버전을 짝짓는다", () => {
    const submitted = makeVersion({
      versionId: "v1",
      versionNumber: 1,
      answerStatus: "제출본",
      isLocked: true,
    });
    const improved = makeVersion({ versionId: "v2", versionNumber: 2, answerStatus: "개선본" });

    expect(getSubmittedComparePair([submitted, improved])).toEqual({
      left: submitted,
      right: improved,
    });
  });

  it("제출본이 여러 번이면 가장 최근 제출본을 기준으로 짝짓는다", () => {
    const firstSubmitted = makeVersion({
      versionId: "v1",
      versionNumber: 1,
      answerStatus: "제출본",
      isLocked: true,
    });
    const improvedAfterFirst = makeVersion({
      versionId: "v2",
      versionNumber: 2,
      answerStatus: "개선본",
    });
    const secondSubmitted = makeVersion({
      versionId: "v3",
      versionNumber: 3,
      answerStatus: "제출본",
      isLocked: true,
    });
    const current = makeVersion({ versionId: "v4", versionNumber: 4, answerStatus: "개선본" });

    const pair = getSubmittedComparePair([
      firstSubmitted,
      improvedAfterFirst,
      secondSubmitted,
      current,
    ]);

    expect(pair).toEqual({ left: secondSubmitted, right: current });
  });
});

describe("resolveVersionOrDefault", () => {
  it("후보 목록에 있는 버전 id면 해당 버전을 돌려준다", () => {
    const a = makeVersion({ versionId: "v1" });
    const b = makeVersion({ versionId: "v2" });

    expect(resolveVersionOrDefault([a, b], "v2", a)).toBe(b);
  });

  it("다른 사용자 소유라 후보 목록에 없는 id는 fallback으로 대체하고 내용을 노출하지 않는다", () => {
    const own = makeVersion({ versionId: "v1" });
    const fallback = makeVersion({ versionId: "v2" });

    expect(resolveVersionOrDefault([own], "other-users-version-id", fallback)).toBe(fallback);
  });

  it("id가 없으면 fallback을 돌려준다", () => {
    const own = makeVersion({ versionId: "v1" });

    expect(resolveVersionOrDefault([own], undefined, own)).toBe(own);
  });
});
