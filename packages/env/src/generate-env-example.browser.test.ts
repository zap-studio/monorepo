import type { StandardSchemaV1 } from "@zap-studio/validation";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import type { EnvironmentSchema } from "./types.ts";

import { EnvironmentError } from "./errors.ts";
import { generateEnvironmentExample } from "./generate-env-example.ts";

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

describe("generateEnvironmentExample", () => {
  it("returns an empty string for an empty schema", () => {
    expect(generateEnvironmentExample({})).toBe("");
  });

  it("marks a key with no default as required", () => {
    const output = generateEnvironmentExample({ server: { DATABASE_URL: z.string() } });

    expect(output).toBe("# server, required\nDATABASE_URL=\n");
  });

  it("marks an optional key as optional", () => {
    const output = generateEnvironmentExample({ server: { PORT: z.string().optional() } });

    expect(output).toContain("# server, optional\nPORT=");
  });

  it("marks a key with a default value as optional", () => {
    const output = generateEnvironmentExample({
      server: { PORT: z.coerce.number().default(3000) },
    });

    expect(output).toContain("# server, optional\nPORT=");
  });

  it("labels the bucket for shared and client keys", () => {
    const output = generateEnvironmentExample({
      shared: { NODE_ENV: z.enum(["development", "production"]) },
      client: { PUBLIC_API_URL: z.string() },
      clientPrefix: "PUBLIC_",
    });

    expect(output).toContain("# shared, required\nNODE_ENV=");
    expect(output).toContain("# client, required, prefix: PUBLIC_\nPUBLIC_API_URL=");
  });

  it("sorts keys alphabetically regardless of declaration order", () => {
    const output = generateEnvironmentExample({
      server: { ZULU: z.string(), ALPHA: z.string() },
    });

    expect(output.indexOf("ALPHA=")).toBeLessThan(output.indexOf("ZULU="));
  });

  it("composes extends sources into the output", () => {
    const dbSchema = { server: { DATABASE_URL: z.string() } } satisfies EnvironmentSchema;

    const output = generateEnvironmentExample({
      extends: [dbSchema],
      server: { PORT: z.coerce.number() },
    });

    expect(output).toContain("DATABASE_URL=");
    expect(output).toContain("PORT=");
  });

  it("throws an EnvironmentError for the same conflicts createEnvironment rejects", () => {
    expect(() =>
      generateEnvironmentExample({
        client: { API_URL: z.string() },
        clientPrefix: "PUBLIC_",
      }),
    ).toThrow(EnvironmentError);
  });

  it("marks a key as required when its schema throws synchronously on undefined", () => {
    const output = generateEnvironmentExample({ server: { WEIRD: throwingSchema } });

    expect(output).toBe("# server, required\nWEIRD=\n");
  });

  it("conservatively marks an async schema's key as required", () => {
    const output = generateEnvironmentExample({ server: { ASYNC_VAR: asyncSchema } });

    expect(output).toBe("# server, required\nASYNC_VAR=\n");
  });

  it("never reads from any actual environment", () => {
    const output = generateEnvironmentExample({ server: { SECRET: z.string() } });

    expect(output).toBe("# server, required\nSECRET=\n");
  });
});
