import type { StandardSchemaV1 } from "@zap-studio/validation";

import { context, trace } from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Actions, Resources } from "./types.ts";

import { allow, createPolicy, mergePoliciesOr } from "./index.ts";

const createSchema = <T>(): StandardSchemaV1<T, T> => {
  return {
    "~standard": {
      // SAFETY: this test-only schema is only ever wired to `resources.post`, and every value it validates in this file is a `post` object literal already shaped as `Post` (authorId, id), so trusting `value` as `T` here never actually crosses a real validation boundary.
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
  post: ["read"],
} as const satisfies Actions<typeof resources>;

interface TestContext {
  user: { id: string };
}

describe("permit OpenTelemetry active context", () => {
  const spanExporter = new InMemorySpanExporter();

  beforeAll(() => {
    context.setGlobalContextManager(new AsyncHooksContextManager().enable());
    const provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(spanExporter)],
    });
    trace.setGlobalTracerProvider(provider);
  });

  beforeEach(() => {
    spanExporter.reset();
  });

  const post: Post = { authorId: "user-1", id: "1" };

  it("makes the check span active while the rule runs, so nested work sees it", async () => {
    let activeSpanIdDuringRule: string | undefined;

    const policy = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: {
        post: {
          read: () => {
            activeSpanIdDuringRule = trace.getActiveSpan()?.spanContext().spanId;
            return "allow";
          },
        },
      },
    });

    await policy.can({ user: { id: "user-1" } }, "post:read", post);

    const [span] = spanExporter.getFinishedSpans();
    expect(activeSpanIdDuringRule).toBe(span?.spanContext().spanId);
  });

  it("nests a merged policy's constituent check spans under the composite span", async () => {
    const policyA = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: { post: { read: allow() } },
    });
    const policyB = createPolicy<TestContext, typeof resources, typeof actions>({
      actions,
      resources,
      rules: { post: { read: allow() } },
    });
    const merged = mergePoliciesOr(policyA, policyB);

    await merged.can({ user: { id: "user-1" } }, "post:read", post);

    const spans = spanExporter.getFinishedSpans();
    const composite = spans.find((span) => span.parentSpanContext === undefined);
    const constituents = spans.filter((span) => span !== composite);

    expect(composite).toBeDefined();
    expect(constituents).toHaveLength(2);
    for (const span of constituents) {
      expect(span.parentSpanContext?.spanId).toBe(composite?.spanContext().spanId);
    }
  });
});
