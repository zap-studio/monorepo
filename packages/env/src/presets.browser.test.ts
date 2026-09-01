import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createEnvironment } from "./create-env.ts";
import { EnvironmentValidationError } from "./errors.ts";
import {
  cloudflare,
  coolify,
  denoDeploy,
  fly,
  netlify,
  railway,
  render,
  vercel,
} from "./presets.ts";

describe("presets", () => {
  it.each([
    ["vercel", vercel],
    ["netlify", netlify],
    ["render", render],
    ["railway", railway],
    ["fly", fly],
    ["coolify", coolify],
    ["cloudflare", cloudflare],
    ["denoDeploy", denoDeploy],
  ] as const)("exports a %s preset with a shared shape", (_name, preset) => {
    expect(preset.shared).toBeDefined();
    expect(Object.keys(preset.shared ?? {}).length).toBeGreaterThan(0);
  });

  it("treats every preset key as optional (absent on other platforms)", () => {
    const env = createEnvironment({
      extends: [vercel],
      runtimeEnvironment: {},
      isServer: true,
    });

    expect(env["VERCEL"]).toBeUndefined();
  });

  it("passes through the value when the platform var is present", () => {
    const env = createEnvironment({
      extends: [cloudflare],
      runtimeEnvironment: {
        CF_PAGES: "1",
        CF_PAGES_BRANCH: "main",
        CF_PAGES_COMMIT_SHA: "abc123",
        CF_PAGES_URL: "https://example.pages.dev",
      },
      isServer: true,
    });

    expect(env).toEqual({
      CF_PAGES: "1",
      CF_PAGES_BRANCH: "main",
      CF_PAGES_COMMIT_SHA: "abc123",
      CF_PAGES_URL: "https://example.pages.dev",
    });
  });

  it("rejects a preset value that isn't a string, number, or boolean", () => {
    let caught: unknown;
    try {
      createEnvironment({
        extends: [vercel],
        runtimeEnvironment: {},
        // @ts-expect-error VERCEL is given an object value on purpose, to test the runtime check.
        runtimeEnvironmentStrict: { VERCEL: { nested: true } },
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(EnvironmentValidationError);
  });

  it("composes cleanly with an app's own vars via extends", () => {
    const env = createEnvironment({
      extends: [denoDeploy],
      shared: { APP_NAME: z.string() },
      runtimeEnvironment: { DENO_DEPLOYMENT_ID: "dep_123", APP_NAME: "my-app" },
      isServer: true,
    });

    expect(env["DENO_DEPLOYMENT_ID"]).toBe("dep_123");
    expect(env.APP_NAME).toBe("my-app");
  });
});
