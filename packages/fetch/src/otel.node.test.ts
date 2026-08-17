import { context, trace } from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { $fetch } from "./index.js";

describe("$fetch OpenTelemetry active context", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    context.setGlobalContextManager(new AsyncHooksContextManager().enable());
    const provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(new InMemorySpanExporter())],
    });
    trace.setGlobalTracerProvider(provider);
  });

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
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
