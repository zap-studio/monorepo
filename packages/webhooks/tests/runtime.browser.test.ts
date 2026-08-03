import { describe, expect, it } from "vitest";

import { createWebhookRouter } from "../src/index.js";
import { createHmacVerifier } from "../src/verify.js";

const encoder = new TextEncoder();

const signBody = async (body: Uint8Array, secret: string): Promise<string> => {
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
};

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
        path: "/github",
        rawBody: body,
        request: new Request("https://example.com/webhooks/github", {
          headers: {
            "x-hub-signature-256": `sha256=${signature}`,
          },
          method: "POST",
        }),
      })
    ).resolves.toBeUndefined();
  });

  it("routes browser Request objects and preserves response headers", async () => {
    const router = createWebhookRouter().register("/github", ({ path }) => {
      expect(path).toBe("/github");
      return Response.json(
        { ok: true },
        {
          headers: { "x-runtime": "browser" },
          status: 202,
        }
      );
    });

    const response = await router.handle(
      new Request("https://example.com/webhooks/github?delivery=1", {
        body: JSON.stringify({ ok: true }),
        method: "POST",
      })
    );

    expect(response.status).toBe(202);
    expect(response.headers.get("x-runtime")).toBe("browser");
    await expect(response.json()).resolves.toStrictEqual({ ok: true });
  });
});
