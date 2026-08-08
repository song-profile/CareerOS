import { beforeEach, describe, expect, it, vi } from "vitest";
import { getExternalLinks, saveCredential } from "@/features/materials/materials-service";
import { createCredential } from "@/features/materials/api/credential-api";
import { fetchExternalLinks } from "@/features/materials/api/external-link-api";
import { ApiClientError } from "@/lib/api/client";

vi.mock("@/features/auth/api/auth-api", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/features/materials/api/credential-api", () => ({
  createCredential: vi.fn(),
  deleteCredential: vi.fn(),
  fetchCredentialNumber: vi.fn(),
  updateCredential: vi.fn(),
}));

vi.mock("@/features/materials/api/external-link-api", () => ({
  fetchExternalLinks: vi.fn(),
}));

vi.mock("@/features/materials/api/file-api", () => ({
  fetchFiles: vi.fn(),
}));

describe("materials-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns external links from API", async () => {
    vi.mocked(fetchExternalLinks).mockResolvedValue([
      {
        createdAt: new Date("2026-08-08T00:00:00Z"),
        description: "",
        id: "1",
        title: "GitHub",
        type: "GitHub",
        url: "https://github.com/example",
      },
    ]);

    const result = await getExternalLinks();

    expect(result).toMatchObject({ ok: true });
    expect(result.ok && result.value[0].title).toBe("GitHub");
  });

  it("returns validation error from credential save", async () => {
    vi.mocked(createCredential).mockRejectedValue(
      new ApiClientError("validation", "취득일을 확인해 주세요.", { status: 400 }),
    );

    const result = await saveCredential(null, {
      acquiredAt: "",
      credentialNumber: "",
      credentialType: "자격증",
      description: "",
      expiresAt: "",
      grade: "",
      issuer: "",
      name: "",
      score: "",
      validFrom: "",
      permanent: false,
      referenceUrl: "",
      studyMemo: "",
      usageMemo: "",
    });

    expect(result).toEqual({
      ok: false,
      message: "취득일을 확인해 주세요.",
      status: 400,
    });
  });

  it("returns network error message", async () => {
    vi.mocked(fetchExternalLinks).mockRejectedValue(
      new ApiClientError("network", "", {}),
    );

    const result = await getExternalLinks();

    expect(result).toEqual({
      ok: false,
      message: "네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
      status: undefined,
    });
  });
});
