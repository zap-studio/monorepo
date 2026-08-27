import { SpanKind, SpanStatusCode, propagation, trace } from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { HEADERS_GETTER } from "./_otel.ts";
import { createWebhookRouter } from "./index.ts";

const STRIPE_WEBHOOK_PATH = "/webhooks/stripe";

describe("HEADERS_GETTER", () => {
  it("reads a header value by key", () => {
    const headers = new Headers({ traceparent: "00-a-b-01" });
    expect(HEADERS_GETTER.get(headers, "traceparent")).toBe("00-a-b-01");
  });

  it("returns undefined for a missing header", () => {
    const headers = new Headers();
    expect(HEADERS_GETTER.get(headers, "traceparent")).toBeUndefined();
  });

  it("lists all header keys", () => {
    const headers = new Headers({ "x-a": "1", "x-b": "2" });
    expect(HEADERS_GETTER.keys(headers)).toEqual(["x-a", "x-b"]);
  });
});

describe("WebhookRouter OpenTelemetry", () => {
  const exporter = new InMemorySpanExporter();

  const createRequest = (path: string, body?: unknown, headers?: HeadersInit): Request =>
    new Request(new URL(path, "https://example.com"), {
      body: body === undefined ? null : JSON.stringify(body),
      method: "POST",
      ...(headers === undefined ? {} : { headers }),
    });

  beforeAll(() => {
    const provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    trace.setGlobalTracerProvider(provider);
    propagation.setGlobalPropagator(new W3CTraceContextPropagator());
  });

  beforeEach(() => {
    exporter.reset();
  });

  afterEach(() => {
    exporter.reset();
  });

  it("creates a SERVER delivery span and an INTERNAL handler span", async () => {
    const router = createWebhookRouter();
    router.register("/stripe", () => Response.json({ ok: true }));

    await router.handle(createRequest(STRIPE_WEBHOOK_PATH));

    const spans = exporter.getFinishedSpans();
    const delivery = spans.find((span) => span.kind === SpanKind.SERVER);
    const handler = spans.find((span) => span.kind === SpanKind.INTERNAL);

    expect(delivery?.name).toBe("POST /webhooks/stripe");
    expect(delivery?.attributes["http.request.method"]).toBe("POST");
    expect(delivery?.attributes["url.path"]).toBe(STRIPE_WEBHOOK_PATH);
    expect(handler?.name).toBe("webhook.handler /stripe");
    expect(handler?.parentSpanContext?.spanId).toBe(delivery?.spanContext().spanId);
  });

  it("sets http.response.status_code and OK status on a successful delivery", async () => {
    const router = createWebhookRouter();
    router.register("/stripe", () => Response.json({ ok: true }));

    await router.handle(createRequest(STRIPE_WEBHOOK_PATH));

    const delivery = exporter.getFinishedSpans().find((span) => span.kind === SpanKind.SERVER);
    expect(delivery?.attributes["http.response.status_code"]).toBe(200);
    expect(delivery?.status.code).toBe(SpanStatusCode.UNSET);
  });

  it("sets ERROR status on an unmatched route", async () => {
    const router = createWebhookRouter();

    await router.handle(createRequest("/webhooks/missing"));

    const delivery = exporter.getFinishedSpans().find((span) => span.kind === SpanKind.SERVER);
    expect(delivery?.attributes["http.response.status_code"]).toBe(404);
    expect(delivery?.status.code).toBe(SpanStatusCode.ERROR);
  });

  it("records the exception on the handler span when the handler throws", async () => {
    const router = createWebhookRouter();
    router.register("/stripe", () => {
      throw new Error("handler exploded");
    });

    await router.handle(createRequest(STRIPE_WEBHOOK_PATH));

    const spans = exporter.getFinishedSpans();
    const handler = spans.find((span) => span.kind === SpanKind.INTERNAL);
    expect(handler?.status.code).toBe(SpanStatusCode.ERROR);
    expect(handler?.events.some((event) => event.name === "exception")).toBe(true);
  });

  it("continues the sender's trace via an extracted traceparent header", async () => {
    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const parentSpanId = "00f067aa0ba902b7";

    const router = createWebhookRouter();
    router.register("/stripe", () => Response.json({ ok: true }));

    await router.handle(
      createRequest(STRIPE_WEBHOOK_PATH, undefined, {
        traceparent: `00-${traceId}-${parentSpanId}-01`,
      }),
    );

    const delivery = exporter.getFinishedSpans().find((span) => span.kind === SpanKind.SERVER);
    expect(delivery?.spanContext().traceId).toBe(traceId);
    expect(delivery?.parentSpanContext?.spanId).toBe(parentSpanId);
  });
});
