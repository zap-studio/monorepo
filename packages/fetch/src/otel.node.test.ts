import { context, trace } from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import {
  TracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace";
import { type Mock, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { $fetch } from "./index.ts";

describe("$fetch OpenTelemetry active context", () => {
  let fetchMock: Mock<typeof fetch>;

  beforeAll(() => {
    context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable());
    const provider = new TracerProvider({
      spanProcessors: [new SimpleSpanProcessor({ exporter: new InMemorySpanExporter() })],
    });
    trace.setGlobalTracerProvider(provider);
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("makes the request span active while the request runs, so nested work sees it", async () => {
    let activeSpanIdDuringFetch: string | undefined;
    fetchMock.mockImplementation(async () => {
      activeSpanIdDuringFetch = trace.getActiveSpan()?.spanContext().spanId;
      return new Response(null, { status: 200 });
    });

    await $fetch("https://api.example.com/users/1");

    expect(activeSpanIdDuringFetch).toBeDefined();
  });
});
