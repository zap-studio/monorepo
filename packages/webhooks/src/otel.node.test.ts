import { context, trace } from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import {
  TracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createWebhookRouter } from "./index.ts";

describe("WebhookRouter OpenTelemetry active context", () => {
  const spanExporter = new InMemorySpanExporter();

  const createRequest = (path: string): Request =>
    new Request(new URL(path, "https://example.com"), {
      body: null,
      method: "POST",
    });

  beforeAll(() => {
    context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable());
    const provider = new TracerProvider({
      spanProcessors: [new SimpleSpanProcessor({ exporter: spanExporter })],
    });
    trace.setGlobalTracerProvider(provider);
  });

  beforeEach(() => {
    spanExporter.reset();
  });

  it("makes the delivery span active while a before-hook runs, so nested work sees it", async () => {
    let activeSpanIdDuringHook: string | undefined;

    const router = createWebhookRouter({
      before: () => {
        activeSpanIdDuringHook = trace.getActiveSpan()?.spanContext().spanId;
      },
    });
    router.register("/stripe", () => Response.json({ ok: true }));

    await router.handle(createRequest("/webhooks/stripe"));

    const delivery = spanExporter
      .getFinishedSpans()
      .find((span) => span.name === "POST /webhooks/stripe");
    expect(activeSpanIdDuringHook).toBe(delivery?.spanContext().spanId);
  });

  it("makes the handler span active while the handler runs, so nested work sees it", async () => {
    let activeSpanIdDuringHandler: string | undefined;

    const router = createWebhookRouter();
    router.register("/stripe", () => {
      activeSpanIdDuringHandler = trace.getActiveSpan()?.spanContext().spanId;
      return Response.json({ ok: true });
    });

    await router.handle(createRequest("/webhooks/stripe"));

    const handlerSpan = spanExporter
      .getFinishedSpans()
      .find((span) => span.name === "webhook.handler /stripe");
    expect(activeSpanIdDuringHandler).toBe(handlerSpan?.spanContext().spanId);
  });
});
