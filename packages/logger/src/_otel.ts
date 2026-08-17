/**
 * Internal OpenTelemetry wiring for the logger package: trace-log
 * correlation. Kept out of `console.ts` so the console formatter doesn't
 * get tangled with tracing concerns.
 *
 * This is not a full bridge to the OTel Logs API — `Logger` already does
 * that job well. It just stamps the active span's trace context onto the
 * log's context when one is present.
 *
 * @module @zap-studio/logger/otel
 */

import { isSpanContextValid, trace } from "@opentelemetry/api";

/**
 * Merges the active span's `trace_id`/`span_id` into `context`, when a valid
 * span is active. Explicit `context` keys win on collision. Returns
 * `context` unchanged (including `undefined`) when no span is active.
 */
export const withTraceContext = (
  context: Record<string, unknown> | undefined
): Record<string, unknown> | undefined => {
  const spanContext = trace.getActiveSpan()?.spanContext();
  if (spanContext === undefined || !isSpanContextValid(spanContext)) {
    return context;
  }

  return {
    span_id: spanContext.spanId,
    trace_id: spanContext.traceId,
    ...context,
  };
};
