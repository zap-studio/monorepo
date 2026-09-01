/**
 * Internal OpenTelemetry wiring for the env package: tracer resolution and
 * the `env.validate` span. Kept out of `create-env.ts` so validation logic
 * doesn't get tangled with tracing concerns.
 *
 * @module @zap-studio/env/otel
 */

import type { Tracer } from "@opentelemetry/api";

import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";

import pkg from "../package.json" with { type: "json" };
import { EnvValidationError } from "./errors.ts";

/**
 * OpenTelemetry tracer for this package. Resolved once against the global
 * `TracerProvider`; a no-op provider (the default until an app registers an
 * SDK) makes every span call below a no-op too.
 */
const tracer: Tracer = trace.getTracer(pkg.name, pkg.version);

/**
 * Wraps one `createEnv` validation pass in an `INTERNAL` span named
 * `env.validate`. On failure, records the invalid key names (never their
 * values) as the `env.invalid_keys` attribute and marks the span as an
 * error; validation itself runs once at startup, not per-request, so the
 * span cost is negligible.
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
