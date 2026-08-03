import { describe, expect, it } from "vitest";

import { createWebhookRouter } from "../src/index.js";

describe("Path normalization", () => {
  const createRequest = (path: string): Request =>
    new Request(new URL(path, "https://example.com"), {
      body: JSON.stringify({}),
      method: "POST",
    });

  it("should match leading-slash routes under the default /webhooks prefix", async () => {
    const router = createWebhookRouter();

    router.register("/stripe", () => Response.json("ok"));

    const response = await router.handle(createRequest("/webhooks/stripe"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toBe("ok");
  });

  it("should normalize registered paths missing a leading slash or with a trailing slash", async () => {
    const router = createWebhookRouter();

    router.register("stripe/" as "/stripe", () => Response.json("ok"));

    const response = await router.handle(createRequest("/webhooks/stripe"));

    expect(response.status).toBe(200);
  });

  it("should tolerate a trailing slash on the incoming request path", async () => {
    const router = createWebhookRouter();

    router.register("/stripe", () => Response.json("ok"));

    const response = await router.handle(createRequest("/webhooks/stripe/"));

    expect(response.status).toBe(200);
  });

  it("should collapse duplicate slashes in routes and request paths", async () => {
    const router = createWebhookRouter();

    router.register("//stripe//events" as "/stripe/events", () =>
      Response.json("ok")
    );

    const response = await router.handle(
      createRequest("/webhooks//stripe/events")
    );

    expect(response.status).toBe(200);
  });

  it("should not match paths where the prefix is only a segment prefix", async () => {
    const router = createWebhookRouter({ prefix: "/hooks" });

    router.register("/stripe", () => Response.json("ok"));

    const response = await router.handle(createRequest("/hooksters/stripe"));

    expect(response.status).toBe(404);
  });

  it("should normalize a prefix missing a leading slash or with a trailing slash", async () => {
    const router = createWebhookRouter({ prefix: "webhooks/" });

    router.register("/stripe", () => Response.json("ok"));

    const response = await router.handle(createRequest("/webhooks/stripe"));

    expect(response.status).toBe(200);
  });

  it("should mount at the root for an empty prefix", async () => {
    const router = createWebhookRouter({ prefix: "" });

    router.register("/payment", () => Response.json("ok"));

    const response = await router.handle(createRequest("/payment"));

    expect(response.status).toBe(200);
  });

  it("should mount at the root for a bare slash prefix", async () => {
    const router = createWebhookRouter({ prefix: "/" });

    router.register("/payment", () => Response.json("ok"));

    const response = await router.handle(createRequest("/payment"));

    expect(response.status).toBe(200);
  });

  it("should match the root route at the bare prefix with and without a trailing slash", async () => {
    const router = createWebhookRouter();

    router.register("/", () => Response.json("root"));

    const bare = await router.handle(createRequest("/webhooks"));
    const slashed = await router.handle(createRequest("/webhooks/"));

    expect(bare.status).toBe(200);
    expect(slashed.status).toBe(200);
  });

  it("should expose the normalized route path in the handler context", async () => {
    const router = createWebhookRouter();

    let observed: string | null = null;
    router.register("/meta", ({ path }) => {
      observed = path;
      return undefined;
    });

    await router.handle(createRequest("/webhooks/meta"));

    expect(observed).toBe("/meta");
  });
});
