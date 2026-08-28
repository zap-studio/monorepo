import type { StandardSchemaV1 } from "@zap-studio/validation";

import { SpanKind, SpanStatusCode, metrics, trace } from "@opentelemetry/api";
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
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Actions, Resources } from "./types.ts";

import { allow, createPolicy, deny, mergePoliciesOr } from "./index.ts";

const createSchema = <T>(): StandardSchemaV1<T, T> => {
  return {
    "~standard": {
      // SAFETY: this test-only schema is only used by `resources.post`. Every value it checks in this file is a `post` object literal that already has the `Post` shape (authorId, id), so `value as T` is safe and no real validation is skipped.
      validate: (value: unknown) => ({ value: value as T }),
      vendor: "test",
      version: 1,
    },
  };
};

interface Post {
  authorId: string;
  id: string;
}

const resources = { post: createSchema<Post>() } satisfies Resources;
const actions = {
  post: ["read", "write"],
} as const satisfies Actions<typeof resources>;

interface TestContext {
  user: { id: string };
}

describe("permit OpenTelemetry", () => {
  const spanExporter = new InMemorySpanExporter();
  const metricExporter = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
  let meterProvider: MeterProvider;

  beforeAll(() => {
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
  });

  const readCheckCounts = async (): Promise<Record<string, number>> => {
    await meterProvider.forceFlush();
    const resourceMetrics = metricExporter.getMetrics().at(-1);
    const metric = resourceMetrics?.scopeMetrics[0]?.metrics.find(
      (m) => m.descriptor.name === "permit.checks",
    );

    const counts: Record<string, number> = {};
    for (const point of metric?.dataPoints ?? []) {
      const decision = String(point.attributes["permit.decision"]);
      // SAFETY: these dataPoints come from the "permit.checks" Counter metric. Its Sum aggregation always reports a number for `value`. The SDK's DataPoint type is just wider than that.
      counts[decision] = point.value as number;
    }
    return counts;
  };

  const post: Post = { authorId: "user-1", id: "1" };

  it("creates an INTERNAL span per check with the decision attribute set to allow", async () => {
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: { post: { read: allow(), write: deny() } },
    });

    await policy.can({ user: { id: "user-1" } }, "post:read", post);

    const [span] = spanExporter.getFinishedSpans();
    expect(span?.name).toBe("permit.check post:read");
    expect(span?.kind).toBe(SpanKind.INTERNAL);
    expect(span?.attributes["permit.decision"]).toBe("allow");
    expect(span?.status.code).toBe(SpanStatusCode.UNSET);
  });

  it("sets the decision attribute to deny without an ERROR status", async () => {
    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: { post: { read: allow(), write: deny() } },
    });

    await policy.can({ user: { id: "user-1" } }, "post:write", post);

    const [span] = spanExporter.getFinishedSpans();
    expect(span?.attributes["permit.decision"]).toBe("deny");
    expect(span?.status.code).toBe(SpanStatusCode.UNSET);
  });

  it("wraps a merged policy's check in its own span", async () => {
    const policyA = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: { post: { read: deny(), write: deny() } },
    });
    const policyB = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: { post: { read: allow(), write: deny() } },
    });
    const merged = mergePoliciesOr(policyA, policyB);

    await merged.can({ user: { id: "user-1" } }, "post:read", post);

    const spans = spanExporter.getFinishedSpans();
    expect(spans).toHaveLength(3);
    expect(spans.at(-1)?.attributes["permit.decision"]).toBe("allow");
  });

  it("increments the permit.checks counter tagged by decision", async () => {
    const before = await readCheckCounts();

    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: { post: { read: allow(), write: deny() } },
    });
    await policy.can({ user: { id: "user-1" } }, "post:read", post);
    await policy.can({ user: { id: "user-1" } }, "post:write", post);

    const after = await readCheckCounts();
    expect((after["allow"] ?? 0) - (before["allow"] ?? 0)).toBe(1);
    expect((after["deny"] ?? 0) - (before["deny"] ?? 0)).toBe(1);
  });
});
