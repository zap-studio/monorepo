import { context, trace } from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ConsoleLogger } from "./console.ts";
import { jsonFormat } from "./format.ts";

describe("ConsoleLogger trace-log correlation", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    context.setGlobalContextManager(new AsyncHooksContextManager().enable());
    const tracerProvider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(new InMemorySpanExporter())],
    });
    trace.setGlobalTracerProvider(tracerProvider);
  });

  beforeEach(() => {
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
  });

  afterEach(() => {
    infoSpy.mockRestore();
  });

  it("stamps trace_id and span_id onto the log context when a span is active", () => {
    const logger = new ConsoleLogger({ format: jsonFormat });
    const span = trace.getTracer("logger-otel-test").startSpan("caller");

    context.with(trace.setSpan(context.active(), span), () => {
      logger.info("checkpoint", { userId: "u1" });
    });
    span.end();

    // SAFETY: logger.info() above calls console.info with one formatted JSON
    // string from jsonFormat, so the first recorded call is a [string] tuple.
    const [line] = infoSpy.mock.calls[0] as [string];
    const parsed = JSON.parse(line);
    expect(parsed.trace_id).toBe(span.spanContext().traceId);
    expect(parsed.span_id).toBe(span.spanContext().spanId);
    expect(parsed.userId).toBe("u1");
  });

  it("does not add trace fields when no span is active", () => {
    const logger = new ConsoleLogger({ format: jsonFormat });

    logger.info("checkpoint", { userId: "u1" });

    // SAFETY: logger.info() above calls console.info with one formatted JSON
    // string from jsonFormat, so the first recorded call is a [string] tuple.
    const [line] = infoSpy.mock.calls[0] as [string];
    const parsed = JSON.parse(line);
    expect(parsed.trace_id).toBeUndefined();
    expect(parsed.span_id).toBeUndefined();
  });

  it("lets an explicit trace_id in context win over the active span's", () => {
    const logger = new ConsoleLogger({ format: jsonFormat });
    const span = trace.getTracer("logger-otel-test").startSpan("caller");

    context.with(trace.setSpan(context.active(), span), () => {
      logger.info("checkpoint", { trace_id: "explicit" });
    });
    span.end();

    // SAFETY: logger.info() above calls console.info with one formatted JSON
    // string from jsonFormat, so the first recorded call is a [string] tuple.
    const [line] = infoSpy.mock.calls[0] as [string];
    const parsed = JSON.parse(line);
    expect(parsed.trace_id).toBe("explicit");
  });
});
