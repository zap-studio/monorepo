import { describe, expect, it } from "vite-plus/test";
import type { NormalizedRequest } from "../src/types/index.js";
import { createHmacVerifier } from "../src/verify.js";

const encoder = new TextEncoder();

type HmacAlgorithm = "sha1" | "sha256" | "sha384" | "sha512";

describe("createHmacVerifier", () => {
  const createMockRequest = (
    body: string | Uint8Array,
    signature?: string,
    headerName = "x-hub-signature-256",
  ): NormalizedRequest => ({
    method: "POST",
    path: "/webhook",
    headers: new Headers(signature ? { [headerName]: signature } : {}),
    rawBody: typeof body === "string" ? encoder.encode(body) : body,
  });

  const generateValidSignature = async (
    body: string | Uint8Array,
    secret: string,
    algo: HmacAlgorithm = "sha256",
  ): Promise<string> => {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: normalizeHashName(algo) },
      false,
      ["sign"],
    );

    const data = typeof body === "string" ? encoder.encode(body) : body;
    const signature = await crypto.subtle.sign("HMAC", key, data as BufferSource);

    return toHex(new Uint8Array(signature));
  };

  it("verifies a valid signature", async () => {
    const body = JSON.stringify({ event: "test", data: "value" });
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret);
    const verify = createHmacVerifier({
      headerName: "X-Hub-Signature-256",
      secret,
    });

    await expect(verify(createMockRequest(body, signature))).resolves.toBeUndefined();
  });

  it("fails when the signature header is missing", async () => {
    const verify = createHmacVerifier({
      headerName: "X-Hub-Signature-256",
      secret: "my-secret",
    });

    await expect(verify(createMockRequest("body"))).rejects.toMatchObject({
      name: "SignatureError",
      message: "missing signature",
    });
  });

  it("fails when the signature is invalid", async () => {
    const verify = createHmacVerifier({
      headerName: "X-Hub-Signature-256",
      secret: "my-secret",
    });

    await expect(verify(createMockRequest("body", "invalid"))).rejects.toMatchObject({
      name: "SignatureError",
      message: "invalid signature",
    });
  });

  it("accepts prefixed signatures", async () => {
    const body = "test body";
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret);
    const verify = createHmacVerifier({
      headerName: "X-Hub-Signature-256",
      secret,
    });

    await expect(verify(createMockRequest(body, `sha256=${signature}`))).resolves.toBeUndefined();
  });

  it("matches header names case-insensitively through Headers", async () => {
    const body = "test body";
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret);
    const verify = createHmacVerifier({
      headerName: "X-Hub-Signature-256",
      secret,
    });

    await expect(
      verify(createMockRequest(body, signature, "x-hub-signature-256")),
    ).resolves.toBeUndefined();
  });

  it("supports non-default algorithms", async () => {
    const body = "test body";
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret, "sha512");
    const verify = createHmacVerifier({
      headerName: "X-Hub-Signature-512",
      secret,
      algo: "sha512",
    });

    await expect(
      verify(createMockRequest(body, signature, "x-hub-signature-512")),
    ).resolves.toBeUndefined();
  });

  it("rejects unsupported algorithms", () => {
    expect(() =>
      createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret: "my-secret",
        algo: "md5" as HmacAlgorithm,
      }),
    ).toThrow("Unsupported HMAC algorithm: md5");
  });

  it("verifies exact raw bytes", async () => {
    const body = '{"key":"value"}';
    const modifiedBody = '{"key": "value"}';
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret);
    const verify = createHmacVerifier({
      headerName: "X-Hub-Signature-256",
      secret,
    });

    await expect(verify(createMockRequest(body, signature))).resolves.toBeUndefined();
    await expect(verify(createMockRequest(modifiedBody, signature))).rejects.toMatchObject({
      name: "SignatureError",
      message: "invalid signature",
    });
  });

  it("verifies binary request bodies", async () => {
    const body = new Uint8Array([0x00, 0x01, 0x02, 0xff]);
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret);
    const verify = createHmacVerifier({
      headerName: "X-Hub-Signature-256",
      secret,
    });

    await expect(verify(createMockRequest(body, signature))).resolves.toBeUndefined();
  });

  it("throws when Web Crypto is unavailable", () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");

    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: undefined,
    });

    try {
      expect(() =>
        createHmacVerifier({
          headerName: "X-Hub-Signature-256",
          secret: "my-secret",
        }),
      ).toThrow("Web Crypto API is unavailable in this runtime");
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, "crypto", originalDescriptor);
      }
    }
  });
});

function normalizeHashName(algo: HmacAlgorithm): string {
  switch (algo) {
    case "sha1":
      return "SHA-1";
    case "sha256":
      return "SHA-256";
    case "sha384":
      return "SHA-384";
    case "sha512":
      return "SHA-512";
  }
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
