/**
 * Internal OpenTelemetry wiring for the permit package: tracer resolution,
 * the per-check span, and the checks counter. Kept out of `policy.ts` so
 * authorization logic doesn't get tangled with tracing/metrics concerns.
 *
 * @module @zap-studio/permit/otel
 */

import { SpanKind, context, metrics, trace } from "@opentelemetry/api";

import pkg from "../package.json" with { type: "json" };

/**
 * OpenTelemetry tracer for this package. Resolved once against the global
 * `TracerProvider`; a no-op provider (the default until an app registers an
 * SDK) makes every span call below a no-op too.
 */
const tracer = trace.getTracer(pkg.name, pkg.version);

/**
 * Records one authorization check, tagged with `permit.decision: "allow" |
 * "deny"`.
 *
 * Resolves the meter and counter fresh on every call instead of caching
 * them at module scope: unlike `trace.getTracer()`, `metrics.getMeter()`
 * has no proxy indirection — a reference grabbed before an app registers
 * its `MeterProvider` (the common case, since ESM imports resolve before
 * the importing module's own SDK-bootstrap code runs) would stay a no-op
 * forever. Repeated `createCounter` calls with the same name are cheap and
 * idempotent, so this costs nothing meaningful.
 */
const recordPermitCheck = (decision: "allow" | "deny"): void => {
  metrics
    .getMeter(pkg.name, pkg.version)
    .createCounter("permit.checks", {
      description: "Number of authorization checks made, tagged by decision.",
    })
    .add(1, { "permit.decision": decision });
};

/**
 * Wraps one authorization check in an `INTERNAL` span named
 * `permit.check {permission}`, setting `permit.decision` and recording the
 * `permit.checks` counter from `run`'s boolean result.
 */
export const withCheckSpan = async (
  permission: string,
  run: () => Promise<boolean>,
): Promise<boolean> => {
  const span = tracer.startSpan(`permit.check ${permission}`, {
    kind: SpanKind.INTERNAL,
  });

  try {
    return await context.with(trace.setSpan(context.active(), span), async () => {
      const allowed = await run();
      const decision = allowed ? "allow" : "deny";
      span.setAttribute("permit.decision", decision);
      recordPermitCheck(decision);
      return allowed;
    });
  } finally {
    span.end();
  }
};
