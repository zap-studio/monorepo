import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { createEnv } from "./create-env.ts";
import { EnvValidationError } from "./errors.ts";

const INVALID_PORT = "not-a-number";

describe("env OpenTelemetry", () => {
  const spanExporter = new InMemorySpanExporter();

  beforeAll(() => {
    const tracerProvider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(spanExporter)],
    });
    trace.setGlobalTracerProvider(tracerProvider);
  });

  beforeEach(() => {
    spanExporter.reset();
  });

  it("creates an INTERNAL env.validate span with an OK status on success", () => {
    createEnv({
      server: { PORT: z.coerce.number() },
      runtimeEnv: { PORT: "3000" },
      isServer: true,
    });

    const [span] = spanExporter.getFinishedSpans();
    expect(span?.name).toBe("env.validate");
    expect(span?.kind).toBe(SpanKind.INTERNAL);
    expect(span?.status.code).toBe(SpanStatusCode.OK);
  });

  it("records the invalid keys and an ERROR status on failure, never the values", () => {
    try {
      createEnv({
        server: { PORT: z.coerce.number(), SECRET: z.string().min(1) },
        runtimeEnv: { PORT: INVALID_PORT, SECRET: "" },
      });
    } catch {
      // expected: EnvValidationError, checked with the span below.
    }

    const [span] = spanExporter.getFinishedSpans();
    expect(span?.status.code).toBe(SpanStatusCode.ERROR);
    expect(span?.attributes["env.invalid_keys"]).toEqual(["PORT", "SECRET"]);
    expect(JSON.stringify(span?.events)).not.toContain(INVALID_PORT);
  });

  it("does not create a span when validation is skipped", () => {
    createEnv({
      server: { PORT: z.coerce.number() },
      runtimeEnv: { PORT: INVALID_PORT },
      skipValidation: true,
    });

    expect(spanExporter.getFinishedSpans()).toHaveLength(0);
  });

  it("still ends the span when onValidationError throws synchronously", () => {
    expect(() =>
      createEnv({
        server: { PORT: z.coerce.number() },
        runtimeEnv: { PORT: "nope" },
        onValidationError: (): never => {
          throw new Error("custom");
        },
      }),
    ).toThrow("custom");

    const [span] = spanExporter.getFinishedSpans();
    expect(span?.status.code).toBe(SpanStatusCode.ERROR);
  });

  it("still marks the span as an error when a non-Error value is thrown", () => {
    let caught: unknown;
    try {
      createEnv({
        server: { PORT: z.coerce.number() },
        runtimeEnv: { PORT: "nope" },
        onValidationError: (): never => {
          throw "custom string failure";
        },
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe("custom string failure");
    const [span] = spanExporter.getFinishedSpans();
    expect(span?.status.code).toBe(SpanStatusCode.ERROR);
  });

  it("EnvValidationError is still the error type when no onValidationError is given", () => {
    let caught: unknown;
    try {
      createEnv({
        server: { PORT: z.coerce.number() },
        runtimeEnv: { PORT: "nope" },
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(EnvValidationError);
  });
});
