import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import type { EnvironmentSchema } from "./types.ts";

import { createEnvironment } from "./create-env.ts";
import { EnvironmentAccessError, EnvironmentError, EnvironmentValidationError } from "./errors.ts";

const DATABASE_URL_SCHEMA = z.string();
const PREFIX_MESSAGE_PATTERN = /does not start with the required prefix/u;
const INVALID_PORT = "not-a-number";

describe("createEnvironment: shared/server/client", () => {
  it("validates and returns shared, server, and client vars on the server", () => {
    const env = createEnvironment({
      shared: { NODE_ENV: z.enum(["development", "production"]) },
      server: { DATABASE_URL: DATABASE_URL_SCHEMA },
      client: { PUBLIC_API_URL: z.string().url() },
      clientPrefix: "PUBLIC_",
      runtimeEnvironment: {
        NODE_ENV: "production",
        DATABASE_URL: "https://db.example.com",
        PUBLIC_API_URL: "https://api.example.com",
      },
      isServer: true,
    });

    expect(env).toEqual({
      NODE_ENV: "production",
      DATABASE_URL: "https://db.example.com",
      PUBLIC_API_URL: "https://api.example.com",
    });
  });

  it("coerces and applies schema defaults", () => {
    const env = createEnvironment({
      server: { PORT: z.coerce.number().default(3000) },
      runtimeEnvironment: {},
      isServer: true,
    });

    expect(env.PORT).toBe(3000);
  });

  it("prefers runtimeEnvironmentStrict over runtimeEnvironment when both are provided", () => {
    const env = createEnvironment({
      server: { PORT: z.coerce.number() },
      runtimeEnvironment: { PORT: "1" },
      runtimeEnvironmentStrict: { PORT: "2" },
      isServer: true,
    });

    expect(env.PORT).toBe(2);
  });
});

describe("createEnvironment: clientPrefix", () => {
  it("throws an EnvironmentError when client vars are declared without a clientPrefix", () => {
    expect(() =>
      createEnvironment({
        client: { PUBLIC_X: z.string() },
        runtimeEnvironment: { PUBLIC_X: "x" },
      }),
    ).toThrow(EnvironmentError);
  });

  it("throws an EnvironmentError when a client key doesn't start with clientPrefix", () => {
    expect(() =>
      createEnvironment({
        // @ts-expect-error API_URL does not start with clientPrefix on purpose, to test the runtime check.
        client: { API_URL: z.string() },
        clientPrefix: "PUBLIC_",
        runtimeEnvironment: { API_URL: "x" },
      }),
    ).toThrow(PREFIX_MESSAGE_PATTERN);
  });
});

describe("createEnvironment: validation failures", () => {
  it("throws an EnvironmentValidationError listing every invalid key", () => {
    let caught: unknown;
    try {
      createEnvironment({
        server: { PORT: z.coerce.number(), DATABASE_URL: DATABASE_URL_SCHEMA.min(1) },
        runtimeEnvironment: { PORT: INVALID_PORT, DATABASE_URL: "" },
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(EnvironmentValidationError);
    // SAFETY: the check above confirms that `caught` is an `EnvironmentValidationError`.
    expect((caught as EnvironmentValidationError).invalidKeys).toEqual(["DATABASE_URL", "PORT"]);
  });

  it("calls onValidationError instead of throwing EnvironmentValidationError", () => {
    const onValidationError = vi.fn<(issues: unknown) => never>(() => {
      throw new Error("custom handler");
    });

    expect(() =>
      createEnvironment({
        server: { PORT: z.coerce.number() },
        runtimeEnvironment: { PORT: "nope" },
        onValidationError,
      }),
    ).toThrow("custom handler");
    expect(onValidationError).toHaveBeenCalledWith({ PORT: expect.any(Array) });
  });
});

describe("createEnvironment: skipValidation", () => {
  it("returns declared keys unvalidated", () => {
    const env = createEnvironment({
      server: { PORT: z.coerce.number() },
      runtimeEnvironment: { PORT: INVALID_PORT },
      skipValidation: true,
    });

    expect(env.PORT).toBe(INVALID_PORT);
  });
});

describe("createEnvironment: emptyStringAsUndefined", () => {
  it("treats an empty string as undefined before validation", () => {
    const env = createEnvironment({
      server: { NAME: z.string().default("fallback") },
      runtimeEnvironment: { NAME: "" },
      emptyStringAsUndefined: true,
      isServer: true,
    });

    expect(env.NAME).toBe("fallback");
  });

  it("leaves an empty string as-is when the option is off", () => {
    let caught: unknown;
    try {
      createEnvironment({
        server: { NAME: z.string().min(1) },
        runtimeEnvironment: { NAME: "" },
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(EnvironmentValidationError);
  });
});

describe("createEnvironment: server/client access", () => {
  const options = {
    server: { DATABASE_URL: DATABASE_URL_SCHEMA },
    client: { PUBLIC_X: z.string() },
    clientPrefix: "PUBLIC_",
    runtimeEnvironment: { DATABASE_URL: "secret", PUBLIC_X: "public" },
  } as const;

  it("exposes client vars off the server", () => {
    const env = createEnvironment({ ...options, isServer: false });

    expect(env.PUBLIC_X).toBe("public");
  });

  it("throws an EnvironmentAccessError when a server var is read off the server", () => {
    const env = createEnvironment({ ...options, isServer: false });

    expect(() => env.DATABASE_URL).toThrow(EnvironmentAccessError);
  });

  it("calls onInvalidAccess instead of throwing EnvironmentAccessError", () => {
    const onInvalidAccess = vi.fn<(key: string) => never>(() => {
      throw new Error("blocked");
    });
    const env = createEnvironment({ ...options, isServer: false, onInvalidAccess });

    expect(() => env.DATABASE_URL).toThrow("blocked");
    expect(onInvalidAccess).toHaveBeenCalledWith("DATABASE_URL");
  });

  it("defaults isServer to typeof window === 'undefined'", () => {
    const env = createEnvironment(options);

    // In this browser test, `window` is defined, so this acts like a
    // client bundle. Reading the server-only key throws.
    expect(() => env.DATABASE_URL).toThrow(EnvironmentAccessError);
  });

  it("throws an EnvironmentAccessError from Object.getOwnPropertyDescriptor for a server var", () => {
    const env = createEnvironment({ ...options, isServer: false });

    expect(() => Object.getOwnPropertyDescriptor(env, "DATABASE_URL")).toThrow(
      EnvironmentAccessError,
    );
  });

  it("throws an EnvironmentAccessError from Object.getOwnPropertyDescriptors when a server var is declared", () => {
    const env = createEnvironment({ ...options, isServer: false });

    expect(() => Object.getOwnPropertyDescriptors(env)).toThrow(EnvironmentAccessError);
  });

  it("returns the real descriptor from Object.getOwnPropertyDescriptor for a client var", () => {
    const env = createEnvironment({ ...options, isServer: false });

    expect(Object.getOwnPropertyDescriptor(env, "PUBLIC_X")).toMatchObject({ value: "public" });
  });

  it("does not bucket-check a symbol key in Object.getOwnPropertyDescriptor", () => {
    const env = createEnvironment({ ...options, isServer: false });
    const symbolKey = Symbol("not-a-declared-key");

    expect(Object.getOwnPropertyDescriptor(env, symbolKey)).toBeUndefined();
  });

  it("passes symbol-keyed access straight through without a bucket check", () => {
    // SAFETY: this test only reads a symbol key. createEnvironment's declared return
    // type does not, and cannot, model symbol keys. Widening to a plain
    // index type is the point of this test, not an unchecked guess about
    // its shape.
    const env = createEnvironment({ ...options, isServer: false }) as Record<PropertyKey, unknown>;
    const symbolKey = Symbol("not-a-declared-key");

    expect(env[symbolKey]).toBeUndefined();
  });
});

describe("createEnvironment: extends", () => {
  const dbSchema = { server: { DATABASE_URL: DATABASE_URL_SCHEMA } } satisfies EnvironmentSchema;

  it("composes a reusable EnvironmentSchema via extends", () => {
    const env = createEnvironment({
      extends: [dbSchema],
      server: { PORT: z.coerce.number() },
      runtimeEnvironment: { DATABASE_URL: "postgres://x", PORT: "3000" },
      isServer: true,
    });

    expect(env).toEqual({ DATABASE_URL: "postgres://x", PORT: 3000 });
  });

  it("allows the exact same schema reference reused across sources", () => {
    const sharedSchema = z.string();
    const base = { server: { NAME: sharedSchema } } satisfies EnvironmentSchema;

    const env = createEnvironment({
      extends: [base],
      server: { NAME: sharedSchema },
      runtimeEnvironment: { NAME: "x" },
      isServer: true,
    });

    expect(env.NAME).toBe("x");
  });

  it("throws an EnvironmentError when two sources declare the same key with different schemas", () => {
    const base = { server: { NAME: z.string() } } satisfies EnvironmentSchema;

    expect(() =>
      createEnvironment({
        extends: [base],
        server: { NAME: z.number() },
        runtimeEnvironment: {},
      }),
    ).toThrow(EnvironmentError);
  });

  it("throws an EnvironmentError when the same key moves buckets across sources", () => {
    const sharedSchema = z.string();
    const base = { shared: { NAME: sharedSchema } } satisfies EnvironmentSchema;

    expect(() =>
      createEnvironment({
        extends: [base],
        server: { NAME: sharedSchema },
        runtimeEnvironment: {},
      }),
    ).toThrow(EnvironmentError);
  });

  it("composes multiple extends sources together", () => {
    const dbEnvironment = {
      server: { DATABASE_URL: DATABASE_URL_SCHEMA },
    } satisfies EnvironmentSchema;
    const cacheEnvironment = { server: { REDIS_URL: z.string() } } satisfies EnvironmentSchema;

    const env = createEnvironment({
      extends: [dbEnvironment, cacheEnvironment],
      runtimeEnvironment: { DATABASE_URL: "db", REDIS_URL: "redis" },
      isServer: true,
    });

    expect(env).toEqual({ DATABASE_URL: "db", REDIS_URL: "redis" });
  });
});
