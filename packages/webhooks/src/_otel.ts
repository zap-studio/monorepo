/**
 * Internal OpenTelemetry wiring for the webhooks package: tracer resolution,
 * the `Headers` extraction carrier, and span error recording. Kept out of
 * `router.ts` so dispatch logic doesn't get tangled with tracing concerns.
 *
 * @module @zap-studio/webhooks/otel
 */

import type { Span, TextMapGetter, Tracer } from "@opentelemetry/api";

import { SpanStatusCode, trace } from "@opentelemetry/api";

import pkg from "../package.json" with { type: "json" };

/**
 * OpenTelemetry tracer for this package. Resolved once against the global
 * `TracerProvider`; a no-op provider (the default until an app registers an
 * SDK) makes every span/propagation call below a no-op too.
 */
export const tracer: Tracer = trace.getTracer(pkg.name, pkg.version);

/**
 * `TextMapGetter` for the Web `Headers` API, used to extract an inbound
 * delivery's `traceparent` (and any other registered propagator fields) so
 * the delivery span continues the sender's trace instead of starting a new one.
 */
// fallow-ignore-next-line code-duplication -- this copies fetch/_otel.ts on purpose, so the two packages do not depend on each other
export const HEADERS_GETTER: TextMapGetter<Headers> = {
  get(carrier, key) {
    return carrier.get(key) ?? undefined;
  },
  keys(carrier) {
    return [...carrier.keys()];
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
