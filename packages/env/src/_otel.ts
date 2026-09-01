/**
 * Internal OpenTelemetry setup for the env package: getting the tracer and
 * creating the `env.validate` span. Kept out of `create-env.ts` so the
 * validation code stays separate from the tracing code.
 *
 * @module @zap-studio/env/otel
 */

import type { Tracer } from "@opentelemetry/api";

import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";

import pkg from "../package.json" with { type: "json" };
import { EnvValidationError } from "./errors.ts";

/**
 * OpenTelemetry tracer for this package. Fetched once from the global
 * `TracerProvider`. Until an app sets up an SDK, the default provider does
 * nothing, so every span call below also does nothing.
 */
const tracer: Tracer = trace.getTracer(pkg.name, pkg.version);

/**
 * Wraps one `createEnv` validation pass in an `INTERNAL` span named
 * `env.validate`. On failure, it stores the invalid key names, never their
 * values, as the `env.invalid_keys` attribute, and marks the span as an
 * error. Validation runs once at startup, not on every request, so the
 * span costs very little.
 */
export const withValidateSpan = <T>(run: () => T): T => {
  const span = tracer.startSpan("env.validate", { kind: SpanKind.INTERNAL });

  try {
    const result = run();
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    if (error instanceof EnvValidationError) {
      span.setAttribute("env.invalid_keys", [...error.invalidKeys]);
    }
    if (error instanceof Error) {
      span.recordException(error);
    }
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw error;
  } finally {
    span.end();
  }
};
