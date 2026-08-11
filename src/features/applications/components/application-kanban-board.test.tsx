import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationKanbanBoard } from "@/features/applications/components/application-kanban-board";
import { DEFAULT_APPLICATION_SEARCH_STATE } from "@/features/applications/search-params";
import type { ApplicationListItem, ApplicationStatus } from "@/features/applications/types";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }),
}));

function makeApplication(
  id: string,
  status: ApplicationStatus,
  companyName = `회사 ${id}`,
): ApplicationListItem {
  return {
    id,
    companyName,
    position: "IT 개발",
    recruitmentYear: 2026,
    season: "하반기",
    deadline: new Date("2026-09-14T09:00:00Z"),
    status,
    progress: 30,
    createdAt: new Date("2026-08-01T00:00:00Z"),
  };
}

function applicationDto(status: string) {
  return {
    id: 1,
    companyId: 1,
    companyName: "회사 1",
    companyHomepageUrl: null,
    positionName: "IT 개발",
    recruitmentTitle: null,
    recruitmentYear: 2026,
    season: "SECOND_HALF",
    postingUrl: null,
    applicationStartAt: null,
    deadlineAt: "2026-09-14T09:00:00Z",
    status,
    workLocation: null,
    applicationSiteUrl: null,
    memo: null,
    submittedAt: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    statusHistories: [
      { id: 1, previousStatus: "WRITING", newStatus: status, changedAt: "2026-08-11T00:00:00Z" },
    ],
  };
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** jsdom에는 DataTransfer 구현이 없어서 드래그가 실제로 주고받는 값만 흉내 낸다. */
function createDataTransfer(): DataTransfer {
  const store: Record<string, string> = {};

  return {
    dropEffect: "none",
    effectAllowed: "none",
    setData: (type: string, value: string) => {
      store[type] = value;
    },
    getData: (type: string) => store[type] ?? "",
  } as unknown as DataTransfer;
}

function renderBoard(applications: ApplicationListItem[]) {
  return render(
    <ApplicationKanbanBoard
      applications={applications}
      nextSchedules={{
        "1": { label: "코딩테스트", startAt: new Date("2026-09-03T05:00:00Z") },
      }}
      searchState={{ ...DEFAULT_APPLICATION_SEARCH_STATE, view: "kanban" }}
    />,
  );
}

function getColumn(status: string) {
  return screen.getByRole("region", { name: new RegExp(`^${status} `) });
}

function dragCardToColumn(cardName: string, columnStatus: string) {
  const dataTransfer = createDataTransfer();
  const card = screen.getByRole("link", { name: cardName }).closest("[draggable]");

  if (!card) {
    throw new Error("드래그할 카드를 찾지 못했습니다.");
  }

  fireEvent.dragStart(card, { dataTransfer });
  fireEvent.drop(getColumn(columnStatus), { dataTransfer });
}

describe("ApplicationKanbanBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("상태별 컬럼에 카드를 놓고, 비어 있는 상태도 컬럼으로 남긴다", () => {
    renderBoard([makeApplication("1", "작성중")]);

    expect(within(getColumn("작성중")).getByRole("link", { name: "회사 1" })).toBeInTheDocument();
    expect(screen.getAllByText("해당 상태의 지원 건이 없습니다.")).toHaveLength(7);
    expect(screen.getByText(/다음 일정 코딩테스트/)).toBeInTheDocument();
  });

  it("드래그로 옮기면 이력을 남기는 기존 상태 변경 API를 호출하고 카드가 새 컬럼으로 간다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(applicationDto("INTERVIEW"), 200));
    vi.stubGlobal("fetch", fetchMock);

    renderBoard([makeApplication("1", "작성중")]);
    dragCardToColumn("회사 1", "면접");

    await waitFor(() => {
      expect(within(getColumn("면접")).getByRole("link", { name: "회사 1" })).toBeInTheDocument();
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/applications/1/status");
    expect(options).toMatchObject({ method: "PATCH", credentials: "include" });
    expect(JSON.parse(options.body)).toEqual({ status: "INTERVIEW" });
    expect(refresh).toHaveBeenCalled();
  });

  it("API가 실패하면 카드를 원래 컬럼으로 되돌리고 오류를 알린다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ code: "INTERNAL_SERVER_ERROR" }, 500)),
    );

    renderBoard([makeApplication("1", "작성중")]);
    dragCardToColumn("회사 1", "면접");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "서버 오류로 지원 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
    expect(within(getColumn("작성중")).getByRole("link", { name: "회사 1" })).toBeInTheDocument();
    expect(within(getColumn("면접")).queryByRole("link", { name: "회사 1" })).not.toBeInTheDocument();
  });

  it("다른 사용자의 지원 건이면 상태를 바꾸지 않고 되돌린다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ code: "NOT_FOUND", message: "지원 건을 찾을 수 없습니다." }, 404),
      ),
    );

    renderBoard([makeApplication("1", "작성중")]);
    dragCardToColumn("회사 1", "면접");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "대상을 찾을 수 없어 지원 상태를 변경할 수 없습니다.",
    );
    expect(within(getColumn("작성중")).getByRole("link", { name: "회사 1" })).toBeInTheDocument();
  });

  it("드래그 없이 카드의 상태 선택만으로도 상태를 바꾼다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(applicationDto("SUBMITTED"), 200));
    vi.stubGlobal("fetch", fetchMock);

    renderBoard([makeApplication("1", "작성중")]);
    await userEvent.selectOptions(screen.getByLabelText("회사 1 상태 변경"), "지원완료");

    await waitFor(() => {
      expect(within(getColumn("지원완료")).getByRole("link", { name: "회사 1" })).toBeInTheDocument();
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/applications/1/status");
    expect(JSON.parse(options.body)).toEqual({ status: "SUBMITTED" });
  });
});
