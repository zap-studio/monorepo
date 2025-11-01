// biome-ignore-all lint/style/noMagicNumbers: This is a test file so magic numbers are acceptable here.

import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { NormalizedRequest } from "../src/types";
import { createHmacVerifier } from "../src/verify";

describe("createHmacVerifier", () => {
  const createMockRequest = (
    body: string,
    signature?: string,
    headerName = "x-hub-signature-256"
  ): NormalizedRequest => ({
    method: "POST",
    path: "/webhook",
    headers: new Headers(
      signature ? { [headerName.toLowerCase()]: signature } : {}
    ),
    rawBody: Buffer.from(body),
  });

  const generateValidSignature = (body: string, secret: string): string =>
    createHmac("sha256", secret).update(body).digest("hex");

  describe("basic functionality", () => {
    it("should successfully verify a valid HMAC signature", async () => {
      const secret = "my-secret-key";
      const body = JSON.stringify({ event: "test", data: "value" });
      const signature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body, signature);

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should throw SignatureError when signature is missing", async () => {
      const secret = "my-secret-key";
      const body = JSON.stringify({ event: "test" });

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body); // No signature

      await expect(verify(req)).rejects.toThrow("missing signature");
      await expect(verify(req)).rejects.toMatchObject({
        name: "SignatureError",
      });
    });

    it("should throw SignatureError when signature is invalid", async () => {
      const secret = "my-secret-key";
      const body = JSON.stringify({ event: "test" });
      const invalidSignature = "invalid_signature_value";

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body, invalidSignature);

      await expect(verify(req)).rejects.toThrow("invalid signature");
      await expect(verify(req)).rejects.toMatchObject({
        name: "SignatureError",
      });
    });

    it("should throw SignatureError when signature is for different content", async () => {
      const secret = "my-secret-key";
      const body1 = JSON.stringify({ event: "test1" });
      const body2 = JSON.stringify({ event: "test2" });
      const signature = generateValidSignature(body1, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body2, signature); // Signature for body1, but sending body2

      await expect(verify(req)).rejects.toThrow("invalid signature");
      await expect(verify(req)).rejects.toMatchObject({
        name: "SignatureError",
      });
    });

    it("should throw SignatureError when secret is incorrect", async () => {
      const correctSecret = "correct-secret";
      const wrongSecret = "wrong-secret";
      const body = JSON.stringify({ event: "test" });
      const signature = generateValidSignature(body, correctSecret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret: wrongSecret,
      });

      const req = createMockRequest(body, signature);

      await expect(verify(req)).rejects.toThrow("invalid signature");
      await expect(verify(req)).rejects.toMatchObject({
        name: "SignatureError",
      });
    });
  });

  describe("header name handling", () => {
    it("should work with custom header name", async () => {
      const secret = "my-secret";
      const body = "test body";
      const signature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "X-Custom-Signature",
        secret,
      });

      const req = createMockRequest(body, signature, "x-custom-signature");

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should be case-insensitive for header names", async () => {
      const secret = "my-secret";
      const body = "test body";
      const signature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      // Test with different case variations
      const req1 = createMockRequest(body, signature, "x-hub-signature-256");
      await expect(verify(req1)).resolves.toBeUndefined();

      const req2 = createMockRequest(body, signature, "X-HUB-SIGNATURE-256");
      await expect(verify(req2)).resolves.toBeUndefined();

      const req3 = createMockRequest(body, signature, "X-Hub-Signature-256");
      await expect(verify(req3)).resolves.toBeUndefined();
    });

    it("should handle GitHub-style signatures", async () => {
      const secret = "github-webhook-secret";
      const body = '{"action":"opened","number":1}';
      const signature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body, signature);

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should handle Stripe-style signatures", async () => {
      const secret = "stripe-webhook-secret";
      const body = '{"id":"evt_test","type":"payment_intent.succeeded"}';
      const signature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "Stripe-Signature",
        secret,
      });

      const req = createMockRequest(body, signature, "stripe-signature");

      await expect(verify(req)).resolves.toBeUndefined();
    });
  });

  describe("signature format handling", () => {
    it("should handle signatures with sha256= prefix", async () => {
      const secret = "my-secret";
      const body = "test body";
      const rawSignature = generateValidSignature(body, secret);
      const prefixedSignature = `sha256=${rawSignature}`;

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body, prefixedSignature);

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should handle signatures without prefix", async () => {
      const secret = "my-secret";
      const body = "test body";
      const signature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body, signature);

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should strip sha256= prefix when comparing", async () => {
      const secret = "my-secret";
      const body = "test body";
      const rawSignature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      // With prefix
      const req1 = createMockRequest(body, `sha256=${rawSignature}`);
      await expect(verify(req1)).resolves.toBeUndefined();

      // Without prefix
      const req2 = createMockRequest(body, rawSignature);
      await expect(verify(req2)).resolves.toBeUndefined();
    });
  });

  describe("algorithm support", () => {
    it("should default to sha256 algorithm", async () => {
      const secret = "my-secret";
      const body = "test body";
      const signature = createHmac("sha256", secret).update(body).digest("hex");

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body, signature);

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should support sha1 algorithm", async () => {
      const secret = "my-secret";
      const body = "test body";
      const signature = createHmac("sha1", secret).update(body).digest("hex");

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature",
        secret,
        algo: "sha1",
      });

      const req = createMockRequest(body, signature, "x-hub-signature");

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should support sha512 algorithm", async () => {
      const secret = "my-secret";
      const body = "test body";
      const signature = createHmac("sha512", secret).update(body).digest("hex");

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-512",
        secret,
        algo: "sha512",
      });

      const req = createMockRequest(body, signature, "x-hub-signature-512");

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should reject signature when algorithm mismatch", async () => {
      const secret = "my-secret";
      const body = "test body";
      const sha1Signature = createHmac("sha1", secret)
        .update(body)
        .digest("hex");

      // Configure for sha256 but provide sha1 signature
      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
        algo: "sha256",
      });

      const req = createMockRequest(body, sha1Signature);

      await expect(verify(req)).rejects.toThrow("invalid signature");
    });
  });

  describe("content handling", () => {
    it("should verify empty body correctly", async () => {
      const secret = "my-secret";
      const body = "";
      const signature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body, signature);

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should verify JSON body correctly", async () => {
      const secret = "my-secret";
      const body = JSON.stringify({
        event: "user.created",
        data: { id: 123, email: "test@example.com" },
      });
      const signature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body, signature);

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should verify large body correctly", async () => {
      const secret = "my-secret";
      const body = JSON.stringify({
        data: "x".repeat(10_000),
      });
      const signature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body, signature);

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should be sensitive to whitespace in body", async () => {
      const secret = "my-secret";
      const body1 = '{"key":"value"}';
      const body2 = '{"key": "value"}'; // Extra space
      const signature = generateValidSignature(body1, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      // Should succeed with original body
      const req1 = createMockRequest(body1, signature);
      await expect(verify(req1)).resolves.toBeUndefined();

      // Should fail with modified body
      const req2 = createMockRequest(body2, signature);
      await expect(verify(req2)).rejects.toThrow("invalid signature");
    });

    it("should handle binary data correctly", async () => {
      const secret = "my-secret";
      const binaryData = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe, 0xfd]);
      const signature = createHmac("sha256", secret)
        .update(binaryData)
        .digest("hex");

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req: NormalizedRequest = {
        method: "POST",
        path: "/webhook",
        headers: new Headers({ "x-hub-signature-256": signature }),
        rawBody: binaryData,
      };

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should handle unicode content correctly", async () => {
      const secret = "my-secret";
      const body = JSON.stringify({ message: "Hello 世界 🌍" });
      const signature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body, signature);

      await expect(verify(req)).resolves.toBeUndefined();
    });
  });

  describe("security considerations", () => {
    it("should use constant-time comparison to prevent timing attacks", async () => {
      const secret = "my-secret";
      const body = "test body";
      const correctSignature = generateValidSignature(body, secret);
      const incorrectSignature = "a".repeat(correctSignature.length);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      // Both should fail, but timing should be similar (constant-time)
      const req1 = createMockRequest(body, incorrectSignature);
      await expect(verify(req1)).rejects.toThrow("invalid signature");

      // Try with one character different
      const almostCorrect =
        correctSignature.slice(0, -1) +
        (correctSignature.at(-1) === "a" ? "b" : "a");
      const req2 = createMockRequest(body, almostCorrect);
      await expect(verify(req2)).rejects.toThrow("invalid signature");
    });

    it("should prevent replay attacks by verifying exact content", async () => {
      const secret = "my-secret";
      const originalBody = JSON.stringify({ id: 1, timestamp: 1_234_567_890 });
      const signature = generateValidSignature(originalBody, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      // Original request should pass
      const req1 = createMockRequest(originalBody, signature);
      await expect(verify(req1)).resolves.toBeUndefined();

      // Modified body should fail even with same signature
      const modifiedBody = JSON.stringify({ id: 2, timestamp: 1_234_567_890 });
      const req2 = createMockRequest(modifiedBody, signature);
      await expect(verify(req2)).rejects.toThrow("invalid signature");
    });

    it("should handle malicious signature attempts", async () => {
      const secret = "my-secret";
      const body = "test body";

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      // SQL injection attempt in signature
      const req1 = createMockRequest(body, "' OR '1'='1");
      await expect(verify(req1)).rejects.toThrow("invalid signature");

      // XSS attempt in signature
      const req2 = createMockRequest(body, "<script>alert('xss')</script>");
      await expect(verify(req2)).rejects.toThrow("invalid signature");

      // Path traversal attempt in signature
      const req3 = createMockRequest(body, "../../etc/passwd");
      await expect(verify(req3)).rejects.toThrow("invalid signature");
    });
  });

  describe("real-world scenarios", () => {
    it("should verify GitHub webhook signature", async () => {
      const secret = "github_webhook_secret_123";
      const payload = JSON.stringify({
        action: "opened",
        pull_request: {
          id: 1,
          number: 42,
          title: "Update README",
        },
      });
      const signature = `sha256=${generateValidSignature(payload, secret)}`;

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(payload, signature);

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should verify Shopify webhook signature", async () => {
      const secret = "shopify_webhook_secret";
      const payload = JSON.stringify({
        id: 12_345,
        email: "customer@example.com",
        created_at: "2024-01-01T00:00:00Z",
      });
      const signature = generateValidSignature(payload, secret);

      const verify = createHmacVerifier({
        headerName: "X-Shopify-Hmac-SHA256",
        secret,
      });

      const req = createMockRequest(
        payload,
        signature,
        "x-shopify-hmac-sha256"
      );

      await expect(verify(req)).resolves.toBeUndefined();
    });

    it("should handle multiple webhooks with same verifier", async () => {
      const secret = "shared-secret";
      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      // First webhook
      const body1 = JSON.stringify({ event: "user.created", id: 1 });
      const sig1 = generateValidSignature(body1, secret);
      const req1 = createMockRequest(body1, sig1);
      await expect(verify(req1)).resolves.toBeUndefined();

      // Second webhook
      const body2 = JSON.stringify({ event: "user.updated", id: 2 });
      const sig2 = generateValidSignature(body2, secret);
      const req2 = createMockRequest(body2, sig2);
      await expect(verify(req2)).resolves.toBeUndefined();

      // Third webhook with wrong signature
      const body3 = JSON.stringify({ event: "user.deleted", id: 3 });
      const req3 = createMockRequest(body3, sig1); // Using sig1 for body3
      await expect(verify(req3)).rejects.toThrow("invalid signature");
    });
  });

  describe("error messages", () => {
    it("should throw error with name SignatureError for missing signature", async () => {
      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret: "secret",
      });

      const req = createMockRequest("body");

      try {
        await verify(req);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe("SignatureError");
        expect((error as Error).message).toBe("missing signature");
      }
    });

    it("should throw error with name SignatureError for invalid signature", async () => {
      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret: "secret",
      });

      const req = createMockRequest("body", "invalid");

      try {
        await verify(req);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).name).toBe("SignatureError");
        expect((error as Error).message).toBe("invalid signature");
      }
    });
  });

  describe("async behavior", () => {
    it("should return a Promise that resolves for valid signatures", async () => {
      const secret = "my-secret";
      const body = "test body";
      const signature = generateValidSignature(body, secret);

      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret,
      });

      const req = createMockRequest(body, signature);
      const result = verify(req);

      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });

    it("should return a Promise that rejects for invalid signatures", async () => {
      const verify = createHmacVerifier({
        headerName: "X-Hub-Signature-256",
        secret: "secret",
      });

      const req = createMockRequest("body", "invalid");
      const result = verify(req);

      expect(result).toBeInstanceOf(Promise);
      await expect(result).rejects.toThrow();
    });
  });
});
