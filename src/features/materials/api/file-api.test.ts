import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  downloadFileBlob,
  fetchFileVersions,
  uploadFileVersion,
} from "@/features/materials/api/file-api";
import { ApiClientError } from "@/lib/api/client";

describe("downloadFileBlob", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each([
    [403, "forbidden"],
    [404, "notFound"],
  ] as const)("maps HTTP %i to a %s ApiClientError", async (status, kind) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "" }), {
          status,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const error = await downloadFileBlob("1").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiClientError);
    expect((error as ApiClientError).kind).toBe(kind);
  });

  it("wraps a network failure as a network ApiClientError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const error = await downloadFileBlob("1").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiClientError);
    expect((error as ApiClientError).kind).toBe("network");
  });

  it("resolves the blob on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Blob(["data"]), { status: 200 })));

    const blob = await downloadFileBlob("1");

    // jsdom's Response doesn't preserve exact Blob byte content, only confirm a blob comes back.
    expect(blob.size).toBeGreaterThan(0);
  });

  it("fetches file versions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([fileDto({ id: 2, version: 2, latest: true })]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const versions = await fetchFileVersions("1");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/files/1/versions",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(versions[0]).toMatchObject({
      id: "2",
      version: 2,
      latest: true,
      rootAssetId: "1",
    });
  });

  it("uploads a new file version as FormData", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(fileDto({ id: 2, version: 2, latest: true })), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const uploaded = await uploadFileVersion(
      "1",
      new File(["v2"], "portfolio-v2.pdf", { type: "application/pdf" }),
      "포트폴리오",
    );

    const [, options] = fetchMock.mock.calls[0];
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8080/api/files/1/versions");
    expect(options).toMatchObject({ method: "POST", credentials: "include" });
    expect(options.body).toBeInstanceOf(FormData);
    expect(uploaded.version).toBe(2);
  });
});

function fileDto(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    category: "PORTFOLIO",
    displayName: "포트폴리오",
    originalFilename: "portfolio.pdf",
    mimeType: "application/pdf",
    size: 1234,
    version: 1,
    parentAssetId: null,
    rootAssetId: 1,
    latest: true,
    downloadUrl: "/api/files/1/download",
    createdAt: "2026-08-10T00:00:00Z",
    updatedAt: "2026-08-10T00:00:00Z",
    ...overrides,
  };
}
