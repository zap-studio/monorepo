import { describe, expect, it } from "vitest";

import type { WebhookContext } from "./types.ts";

import { VerificationError } from "./errors.ts";
import { createHmacVerifier } from "./verify.ts";

const SIGNATURE_HEADER_NAME = "X-Hub-Signature-256";
const INVALID_SIGNATURE_MESSAGE = "Invalid signature for header: X-Hub-Signature-256";

const encoder = new TextEncoder();

type HmacAlgorithm = "sha1" | "sha256" | "sha384" | "sha512";

const normalizeHashName = (algo: HmacAlgorithm): string => {
  switch (algo) {
    case "sha1": {
      return "SHA-1";
    }
    case "sha256": {
      return "SHA-256";
    }
    case "sha384": {
      return "SHA-384";
    }
    case "sha512": {
      return "SHA-512";
    }
    default: {
      return algo;
    }
  }
};

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const captureThrownError = async <T>(run: () => T | Promise<T>): Promise<unknown> => {
  try {
    await run();
    expect.fail("Expected function to throw");
  } catch (error) {
    return error;
  }
  return undefined;
};

describe(createHmacVerifier, () => {
  const createMockContext = (
    body: string | Uint8Array,
    signature?: string,
    headerName = "x-hub-signature-256",
  ): WebhookContext => ({
    path: "webhook",
    rawBody: typeof body === "string" ? encoder.encode(body) : body,
    request: new Request("https://example.com/webhooks/webhook", {
      headers: signature === undefined ? {} : { [headerName]: signature },
      method: "POST",
    }),
  });

  const generateValidSignature = async (
    body: string | Uint8Array,
    secret: string,
    algo: HmacAlgorithm = "sha256",
  ): Promise<string> => {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { hash: normalizeHashName(algo), name: "HMAC" },
      false,
      ["sign"],
    );

    const data = typeof body === "string" ? encoder.encode(body) : body;
    const signature = await crypto.subtle.sign("HMAC", key, data as BufferSource);

    return toHex(new Uint8Array(signature));
  };

  it("verifies a valid signature", async () => {
    const body = JSON.stringify({ data: "value", event: "test" });
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret);
    const verify = createHmacVerifier({
      headerName: SIGNATURE_HEADER_NAME,
      secret,
    });

    await expect(verify(createMockContext(body, signature))).resolves.toBeUndefined();
  });

  it("fails when the signature header is missing", async () => {
    const verify = createHmacVerifier({
      headerName: SIGNATURE_HEADER_NAME,
      secret: "my-secret",
    });

    const error = await captureThrownError(() => verify(createMockContext("body")));

    expect(error).toBeInstanceOf(VerificationError);
    expect(error).toMatchObject({
      message: "Missing signature header: X-Hub-Signature-256",
      name: "VerificationError",
    });
  });

  it("fails when the signature is invalid", async () => {
    const verify = createHmacVerifier({
      headerName: SIGNATURE_HEADER_NAME,
      secret: "my-secret",
    });

    const error = await captureThrownError(() => verify(createMockContext("body", "invalid")));

    expect(error).toBeInstanceOf(VerificationError);
    expect(error).toMatchObject({
      message: INVALID_SIGNATURE_MESSAGE,
      name: "VerificationError",
    });
  });

  it("fails when the signature is valid hex but the wrong length", async () => {
    const verify = createHmacVerifier({
      headerName: SIGNATURE_HEADER_NAME,
      secret: "my-secret",
    });

    const error = await captureThrownError(() => verify(createMockContext("body", "aa")));

    expect(error).toBeInstanceOf(VerificationError);
    expect(error).toMatchObject({
      message: INVALID_SIGNATURE_MESSAGE,
      name: "VerificationError",
    });
  });

  it("accepts prefixed signatures", async () => {
    const body = "test body";
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret);
    const verify = createHmacVerifier({
      headerName: SIGNATURE_HEADER_NAME,
      secret,
    });

    await expect(verify(createMockContext(body, `sha256=${signature}`))).resolves.toBeUndefined();
  });

  it("matches header names case-insensitively through Headers", async () => {
    const body = "test body";
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret);
    const verify = createHmacVerifier({
      headerName: SIGNATURE_HEADER_NAME,
      secret,
    });

    await expect(
      verify(createMockContext(body, signature, "x-hub-signature-256")),
    ).resolves.toBeUndefined();
  });

  it("supports non-default algorithms", async () => {
    const body = "test body";
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret, "sha512");
    const verify = createHmacVerifier({
      algo: "sha512",
      headerName: "X-Hub-Signature-512",
      secret,
    });

    await expect(
      verify(createMockContext(body, signature, "x-hub-signature-512")),
    ).resolves.toBeUndefined();
  });

  it("rejects unsupported algorithms", async () => {
    const error = await captureThrownError(() =>
      createHmacVerifier({
        algo: "md5" as HmacAlgorithm,
        headerName: SIGNATURE_HEADER_NAME,
        secret: "my-secret",
      }),
    );

    expect(error).toBeInstanceOf(VerificationError);
    expect(error).toMatchObject({
      message: "Unsupported HMAC algorithm: md5",
      name: "VerificationError",
    });
  });

  it("verifies exact raw bytes", async () => {
    const body = '{"key":"value"}';
    const modifiedBody = '{"key": "value"}';
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret);
    const verify = createHmacVerifier({
      headerName: SIGNATURE_HEADER_NAME,
      secret,
    });

    await expect(verify(createMockContext(body, signature))).resolves.toBeUndefined();
    const error = await captureThrownError(() =>
      verify(createMockContext(modifiedBody, signature)),
    );

    expect(error).toBeInstanceOf(VerificationError);
    expect(error).toMatchObject({
      message: INVALID_SIGNATURE_MESSAGE,
      name: "VerificationError",
    });
  });

  it("verifies binary request bodies", async () => {
    const body = new Uint8Array([0x00, 0x01, 0x02, 0xff]);
    const secret = "my-secret";
    const signature = await generateValidSignature(body, secret);
    const verify = createHmacVerifier({
      headerName: SIGNATURE_HEADER_NAME,
      secret,
    });

    await expect(verify(createMockContext(body, signature))).resolves.toBeUndefined();
  });

  it("throws when Web Crypto is unavailable", async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");

    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: undefined,
    });

    let error: unknown;
    try {
      error = await captureThrownError(() =>
        createHmacVerifier({
          headerName: SIGNATURE_HEADER_NAME,
          secret: "my-secret",
        }),
      );
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, "crypto", originalDescriptor);
      }
    }

    expect(error).toBeInstanceOf(VerificationError);
    expect(error).toMatchObject({
      message: "Web Crypto API is unavailable in this runtime",
      name: "VerificationError",
    });
  });
});

describe("@zap-studio/webhooks browser runtime", () => {
  const signBody = async (body: Uint8Array, secret: string): Promise<string> => {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { hash: "SHA-256", name: "HMAC" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", key, body as BufferSource);
    return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  };

  it("verifies HMAC signatures with browser Web Crypto and Headers", async () => {
    const body = encoder.encode(JSON.stringify({ event: "push" }));
    const secret = "browser-secret";
    const signature = await signBody(body, secret);
    const verify = createHmacVerifier({
      headerName: SIGNATURE_HEADER_NAME,
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
      }),
    ).resolves.toBeUndefined();
  });
});
