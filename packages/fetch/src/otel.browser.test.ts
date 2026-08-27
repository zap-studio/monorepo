import { SpanKind, SpanStatusCode, propagation, trace } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { $fetch } from "./index.ts";

const USER_URL = "https://api.example.com/users/1";
const TRACEPARENT_PATTERN = /^00-[0-9a-f]{32}-[0-9a-f]{16}-0[01]$/u;

describe("$fetch OpenTelemetry", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const exporter = new InMemorySpanExporter();

  beforeAll(() => {
    const provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    trace.setGlobalTracerProvider(provider);
    propagation.setGlobalPropagator(new W3CTraceContextPropagator());
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    // SAFETY: fetchMock is typed as vi.fn<typeof fetch>(), so its call signature and
    // mockResolvedValue/mockRejectedValue-configured return type already match `typeof fetch`
    // exactly; the cast only drops the extra vitest mock properties for this assignment.
    globalThis.fetch = fetchMock as typeof fetch;
    exporter.reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a CLIENT span with HTTP request attributes", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await $fetch(USER_URL, { method: "GET" });

    const [span] = exporter.getFinishedSpans();
    expect(span?.name).toBe("GET");
    expect(span?.kind).toBe(SpanKind.CLIENT);
    expect(span?.attributes["http.request.method"]).toBe("GET");
    expect(span?.attributes["url.full"]).toBe(USER_URL);
  });

  it("sets http.response.status_code and OK status on a 2xx response", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await $fetch(USER_URL);

    const [span] = exporter.getFinishedSpans();
    expect(span?.attributes["http.response.status_code"]).toBe(204);
    expect(span?.status.code).toBe(SpanStatusCode.UNSET);
  });

  it("sets ERROR status on a non-2xx response", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500, statusText: "Internal Error" }));

    await $fetch(USER_URL, {
      throwOnFetchError: false,
    });

    const [span] = exporter.getFinishedSpans();
    expect(span?.attributes["http.response.status_code"]).toBe(500);
    expect(span?.status.code).toBe(SpanStatusCode.ERROR);
  });

  it("records the exception and ends the span with ERROR status when fetch throws", async () => {
    const networkError = new TypeError("network down");
    fetchMock.mockRejectedValue(networkError);

    await expect($fetch(USER_URL)).rejects.toThrow("network down");

    const [span] = exporter.getFinishedSpans();
    expect(span?.status.code).toBe(SpanStatusCode.ERROR);
    expect(span?.events.some((event) => event.name === "exception")).toBe(true);
  });

  it("sets ERROR status without an exception event when a non-Error value is thrown", async () => {
    fetchMock.mockRejectedValue({ reason: "aborted" });

    await expect($fetch(USER_URL)).rejects.toStrictEqual({
      reason: "aborted",
    });

    const [span] = exporter.getFinishedSpans();
    expect(span?.status.code).toBe(SpanStatusCode.ERROR);
    expect(span?.events.some((event) => event.name === "exception")).toBe(false);
  });

  it("injects a traceparent header into the outgoing request", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await $fetch(USER_URL);

    // SAFETY: fetchInternal calls the global `fetch(url, init)` exactly once per $fetch
    // call (no `request.request` branch here, since USER_URL is a string, not a Request),
    // so calls[0] is a [string, RequestInit] tuple.
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get("traceparent")).toMatch(TRACEPARENT_PATTERN);
  });
});
