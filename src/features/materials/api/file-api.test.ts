import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadFileBlob } from "@/features/materials/api/file-api";
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
});
