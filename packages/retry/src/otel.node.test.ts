import { context, metrics, trace } from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createSequencePolicy } from "./_sequence-policy.ts";
import { runRetryPolicy } from "./base-policy.ts";

const MAX_ATTEMPTS_REASON = "max-attempts-reached";

describe("retry OpenTelemetry", () => {
  const spanExporter = new InMemorySpanExporter();
  const metricExporter = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
  let meterProvider: MeterProvider;

  beforeAll(() => {
    context.setGlobalContextManager(new AsyncHooksContextManager().enable());

    const tracerProvider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(spanExporter)],
    });
    trace.setGlobalTracerProvider(tracerProvider);

    meterProvider = new MeterProvider({
      readers: [
        new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis: 100_000,
        }),
      ],
    });
    metrics.setGlobalMeterProvider(meterProvider);
  });

  beforeEach(() => {
    spanExporter.reset();
    metricExporter.reset();
  });

  /** Runs `run` with a "caller" span active, ends it, and returns its finished record. */
  const runWithActiveSpan = async <T>(run: () => Promise<T>): Promise<T> => {
    const callerSpan = trace.getTracer("retry-otel-test").startSpan("caller");
    try {
      return await context.with(trace.setSpan(context.active(), callerSpan), run);
    } finally {
      callerSpan.end();
    }
  };

  const getCallerSpan = () =>
    spanExporter.getFinishedSpans().find((span) => span.name === "caller");

  it("adds a retry.scheduled event to the active span on each retry", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, reason: "retry", shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    await runWithActiveSpan(() => runRetryPolicy(policy, execute));

    const event = getCallerSpan()?.events.find((e) => e.name === "retry.scheduled");
    expect(event?.attributes?.["attempt"]).toBe(1);
    expect(event?.attributes?.["retry.reason"]).toBe("retry");
  });

  it("defaults retry.reason to an empty string when the policy omits it", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, shouldRetry: true }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    await runWithActiveSpan(() => runRetryPolicy(policy, execute));

    const event = getCallerSpan()?.events.find((e) => e.name === "retry.scheduled");
    expect(event?.attributes?.["retry.reason"]).toBe("");
  });

  it("adds a retry.exhausted event to the active span when retries run out", async () => {
    const policy = createSequencePolicy([
      { delayMs: 0, reason: MAX_ATTEMPTS_REASON, shouldRetry: false },
    ]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValue(new Error("fail"));

    await runWithActiveSpan(() => runRetryPolicy(policy, execute, { throwOnExhausted: false }));

    const event = getCallerSpan()?.events.find((e) => e.name === "retry.exhausted");
    expect(event?.attributes?.["attempt"]).toBe(1);
    expect(event?.attributes?.["retry.reason"]).toBe(MAX_ATTEMPTS_REASON);
  });

  it("defaults retry.reason to an empty string on exhaustion when the policy omits it", async () => {
    const policy = createSequencePolicy([{ delayMs: 0, shouldRetry: false }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValue(new Error("fail"));

    await runWithActiveSpan(() => runRetryPolicy(policy, execute, { throwOnExhausted: false }));

    const event = getCallerSpan()?.events.find((e) => e.name === "retry.exhausted");
    expect(event?.attributes?.["retry.reason"]).toBe("");
  });

  /** Reads `retry.attempts` counter values (per this test's export) by `retry.decision` tag. */
  const readAttemptCounts = async (): Promise<Record<string, number>> => {
    await meterProvider.forceFlush();
    const resourceMetrics = metricExporter.getMetrics().at(-1);
    const metric = resourceMetrics?.scopeMetrics[0]?.metrics.find(
      (m) => m.descriptor.name === "retry.attempts",
    );

    const counts: Record<string, number> = {};
    for (const point of metric?.dataPoints ?? []) {
      const decision = String(point.attributes["retry.decision"]);
      counts[decision] = point.value as number;
    }
    return counts;
  };

  it("increments the retry.attempts counter tagged by decision", async () => {
    // The counter is cumulative and shared across tests in this file, so
    // measure the delta against a baseline rather than the raw total.
    const before = await readAttemptCounts();

    const policy = createSequencePolicy([
      { delayMs: 0, reason: "retry", shouldRetry: true },
      { delayMs: 0, reason: MAX_ATTEMPTS_REASON, shouldRetry: false },
    ]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValue(new Error("fail"));

    await runRetryPolicy(policy, execute, { throwOnExhausted: false });
    const after = await readAttemptCounts();

    expect((after["retry"] ?? 0) - (before["retry"] ?? 0)).toBe(1);
    expect((after["exhausted"] ?? 0) - (before["exhausted"] ?? 0)).toBe(1);
  });
});
