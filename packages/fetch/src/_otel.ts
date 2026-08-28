/**
 * Internal OpenTelemetry wiring for the fetch package: tracer resolution,
 * the `Headers` propagation carrier, and span error recording. Kept out of
 * `index.ts` so request logic doesn't get tangled with tracing concerns.
 *
 * @module @zap-studio/fetch/otel
 */

import type { Span, TextMapSetter, Tracer } from "@opentelemetry/api";

import { SpanStatusCode, trace } from "@opentelemetry/api";

import pkg from "../package.json" with { type: "json" };

/**
 * OpenTelemetry tracer for this package. Resolved once against the global
 * `TracerProvider`; a no-op provider (the default until an app registers an
 * SDK) makes every span/propagation call below a no-op too.
 */
export const tracer: Tracer = trace.getTracer(pkg.name, pkg.version);

/**
 * `TextMapSetter` for the Web `Headers` API, used to inject `traceparent`
 * (and any other registered propagator fields) into the outgoing request.
 */
// fallow-ignore-next-line code-duplication -- this copies webhooks/_otel.ts on purpose, so the two packages do not depend on each other
export const HEADERS_SETTER: TextMapSetter<Headers> = {
  set(carrier, key, value) {
    carrier.set(key, value);
  },
};

/**
 * Records `error` on `span` and marks it as failed. `recordException` only
 * accepts an `Error` or `string`, so other thrown values just get the
 * `ERROR` status without an attached exception event.
 */
export const recordSpanError = (span: Span, error: unknown): void => {
  if (error instanceof Error || typeof error === "string") {
    span.recordException(error);
  }
  span.setStatus({ code: SpanStatusCode.ERROR });
};
