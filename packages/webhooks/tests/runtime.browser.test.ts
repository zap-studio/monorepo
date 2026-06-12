import { describe, expect, it } from "vitest";

import { createWebhookRouter } from "../src/index.js";
import type { NormalizedRequest } from "../src/types/index.js";
import { createHmacVerifier } from "../src/verify.js";

const encoder = new TextEncoder();

describe("@zap-studio/webhooks browser runtime", () => {
  it("verifies HMAC signatures with browser Web Crypto and Headers", async () => {
    const body = encoder.encode(JSON.stringify({ event: "push" }));
    const secret = "browser-secret";
    const signature = await signBody(body, secret);
    const verify = createHmacVerifier({
      headerName: "X-Hub-Signature-256",
      secret,
    });

    await expect(
      verify({
        headers: new Headers({ "x-hub-signature-256": `sha256=${signature}` }),
        method: "POST",
        path: "/webhooks/github",
        rawBody: body,
      })
    ).resolves.toBeUndefined();
  });

  it("routes full browser URL strings and preserves response Headers", async () => {
    const customHeaders = new Headers({ "x-runtime": "browser" });
    const router = createWebhookRouter().register("github", () => ({
      body: { ok: true },
      headers: customHeaders,
      status: 202,
    }));
    const request: NormalizedRequest = {
      headers: new Headers(),
      method: "POST",
      path: "https://example.com/webhooks/github?delivery=1",
      rawBody: encoder.encode(JSON.stringify({ ok: true })),
    };

    const response = await router.handle(request);

    expect(response.status).toBe(202);
    expect(response.headers).toBe(customHeaders);
    expect(response.headers?.get("x-runtime")).toBe("browser");
    expect(request.path).toBe("/github");
  });
});

async function signBody(body: Uint8Array, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, body as BufferSource);
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}
