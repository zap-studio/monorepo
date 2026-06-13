import type { BenchmarkFetch } from "./types.js";

export const installMockFetch = (payload: unknown): BenchmarkFetch => {
  const mockFetch: BenchmarkFetch = async () => {
    await Promise.resolve();
    return Response.json(payload, {
      status: 200,
    });
  };

  globalThis.fetch = mockFetch as typeof fetch;
  return mockFetch;
};
