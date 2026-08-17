/**
 * Internal OpenTelemetry wiring for the retry package: the attempts counter.
 * Kept out of `base-policy.ts` so retry orchestration doesn't get tangled
 * with metrics concerns. Span events are added directly to whatever span is
 * already active (e.g. a caller's fetch span), so this package never
 * creates its own tracer.
 *
 * @module @zap-studio/retry/otel
 */

import { metrics } from "@opentelemetry/api";

import pkg from "../package.json" with { type: "json" };

/**
 * Records one retry decision, tagged with `retry.decision: "retry" |
 * "exhausted"`.
 *
 * Resolves the meter and counter fresh on every call instead of caching
 * them at module scope: unlike `trace.getTracer()`, `metrics.getMeter()`
 * has no proxy indirection — a reference grabbed before an app registers
 * its `MeterProvider` (the common case, since ESM imports resolve before
 * the importing module's own SDK-bootstrap code runs) would stay a no-op
 * forever. Repeated `createCounter` calls with the same name are cheap and
 * idempotent, so this costs nothing meaningful.
 */
export const recordRetryAttempt = (decision: "exhausted" | "retry"): void => {
  metrics
    .getMeter(pkg.name, pkg.version)
    .createCounter("retry.attempts", {
      description: "Number of retry decisions made, tagged by outcome.",
    })
    .add(1, { "retry.decision": decision });
};
