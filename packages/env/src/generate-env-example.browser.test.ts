import type { StandardSchemaV1 } from "@zap-studio/validation";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import type { EnvSchema } from "./types.ts";

import { EnvError } from "./errors.ts";
import { generateEnvExample } from "./generate-env-example.ts";

const throwingSchema: StandardSchemaV1<string> = {
  "~standard": {
    validate: () => {
      throw new Error("this schema always throws, even for undefined");
    },
    vendor: "test",
    version: 1,
  },
};

const asyncSchema: StandardSchemaV1<string> = {
  "~standard": {
    validate: (value: unknown) => Promise.resolve({ value: String(value) }),
    vendor: "test",
    version: 1,
  },
};

describe("generateEnvExample", () => {
  it("returns an empty string for an empty schema", () => {
    expect(generateEnvExample({})).toBe("");
  });

  it("marks a key with no default as required", () => {
    const output = generateEnvExample({ server: { DATABASE_URL: z.string() } });

    expect(output).toBe("# server, required\nDATABASE_URL=\n");
  });

  it("marks an optional key as optional", () => {
    const output = generateEnvExample({ server: { PORT: z.string().optional() } });

    expect(output).toContain("# server, optional\nPORT=");
  });

  it("marks a key with a default value as optional", () => {
    const output = generateEnvExample({ server: { PORT: z.coerce.number().default(3000) } });

    expect(output).toContain("# server, optional\nPORT=");
  });

  it("labels the bucket for shared and client keys", () => {
    const output = generateEnvExample({
      shared: { NODE_ENV: z.enum(["development", "production"]) },
      client: { PUBLIC_API_URL: z.string() },
      clientPrefix: "PUBLIC_",
    });

    expect(output).toContain("# shared, required\nNODE_ENV=");
    expect(output).toContain("# client, required, prefix: PUBLIC_\nPUBLIC_API_URL=");
  });

  it("sorts keys alphabetically regardless of declaration order", () => {
    const output = generateEnvExample({
      server: { ZULU: z.string(), ALPHA: z.string() },
    });

    expect(output.indexOf("ALPHA=")).toBeLessThan(output.indexOf("ZULU="));
  });

  it("composes extends sources into the output", () => {
    const dbSchema = { server: { DATABASE_URL: z.string() } } satisfies EnvSchema;

    const output = generateEnvExample({
      extends: [dbSchema],
      server: { PORT: z.coerce.number() },
    });

    expect(output).toContain("DATABASE_URL=");
    expect(output).toContain("PORT=");
  });

  it("throws an EnvError for the same conflicts createEnv rejects", () => {
    expect(() =>
      generateEnvExample({
        client: { API_URL: z.string() },
        clientPrefix: "PUBLIC_",
      }),
    ).toThrow(EnvError);
  });

  it("marks a key as required when its schema throws synchronously on undefined", () => {
    const output = generateEnvExample({ server: { WEIRD: throwingSchema } });

    expect(output).toBe("# server, required\nWEIRD=\n");
  });

  it("conservatively marks an async schema's key as required", () => {
    const output = generateEnvExample({ server: { ASYNC_VAR: asyncSchema } });

    expect(output).toBe("# server, required\nASYNC_VAR=\n");
  });

  it("never reads from any actual environment", () => {
    const output = generateEnvExample({ server: { SECRET: z.string() } });

    expect(output).toBe("# server, required\nSECRET=\n");
  });
});
