import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCredential } from "./use-credential.ts";

const CREDENTIAL_ID = "user@example.com";
const CREDENTIAL_TYPE = "public-key";

const setNavigatorCredentials = (
  credentials:
    | {
        create: (options?: unknown) => Promise<unknown>;
        get: (options?: unknown) => Promise<unknown>;
        preventSilentAccess: () => Promise<void>;
        store: (credential: unknown) => Promise<void>;
      }
    | undefined,
) => {
  Object.defineProperty(navigator, "credentials", { configurable: true, value: credentials });
};

describe("useCredential", () => {
  it("reports supported: false when navigator.credentials is unavailable", () => {
    setNavigatorCredentials(undefined);

    const { result } = renderHook(() => useCredential());

    expect(result.current.supported).toBe(false);
  });

  it("reports supported: true when navigator.credentials exists", () => {
    setNavigatorCredentials({
      create: () => Promise.resolve(null),
      get: () => Promise.resolve(null),
      preventSilentAccess: () => Promise.resolve(undefined),
      store: () => Promise.resolve(undefined),
    });

    const { result } = renderHook(() => useCredential());

    expect(result.current.supported).toBe(true);
  });

  it("get() forwards options and resolves the credential", async () => {
    const credential = { id: CREDENTIAL_ID, type: CREDENTIAL_TYPE };
    const get = vi.fn<() => Promise<{ id: string; type: string }>>().mockResolvedValue(credential);
    setNavigatorCredentials({
      create: () => Promise.resolve(null),
      get,
      preventSilentAccess: () => Promise.resolve(undefined),
      store: () => Promise.resolve(undefined),
    });

    const { result } = renderHook(() => useCredential());

    await expect(result.current.get({ mediation: "silent" })).resolves.toEqual(credential);
    expect(get).toHaveBeenCalledWith({ mediation: "silent" });
  });

  it("get() resolves undefined when unsupported", async () => {
    setNavigatorCredentials(undefined);

    const { result } = renderHook(() => useCredential());

    await expect(result.current.get()).resolves.toBeUndefined();
  });

  it("store() forwards the credential", async () => {
    const credential = { id: CREDENTIAL_ID, type: CREDENTIAL_TYPE };
    const store = vi.fn<() => Promise<undefined>>().mockResolvedValue(undefined);
    setNavigatorCredentials({
      create: () => Promise.resolve(null),
      get: () => Promise.resolve(null),
      preventSilentAccess: () => Promise.resolve(undefined),
      store,
    });

    const { result } = renderHook(() => useCredential());

    await expect(result.current.store(credential)).resolves.toBeUndefined();
    expect(store).toHaveBeenCalledWith(credential);
  });

  it("store() no-ops when unsupported", async () => {
    setNavigatorCredentials(undefined);

    const { result } = renderHook(() => useCredential());

    await expect(
      result.current.store({ id: CREDENTIAL_ID, type: CREDENTIAL_TYPE }),
    ).resolves.toBeUndefined();
  });

  it("create() forwards options and resolves the credential", async () => {
    const credential = { id: CREDENTIAL_ID, type: CREDENTIAL_TYPE };
    const create = vi
      .fn<() => Promise<{ id: string; type: string }>>()
      .mockResolvedValue(credential);
    setNavigatorCredentials({
      create,
      get: () => Promise.resolve(null),
      preventSilentAccess: () => Promise.resolve(undefined),
      store: () => Promise.resolve(undefined),
    });

    const { result } = renderHook(() => useCredential());

    await expect(result.current.create({})).resolves.toEqual(credential);
    expect(create).toHaveBeenCalledWith({});
  });

  it("create() resolves undefined when unsupported", async () => {
    setNavigatorCredentials(undefined);

    const { result } = renderHook(() => useCredential());

    await expect(result.current.create({})).resolves.toBeUndefined();
  });

  it("preventSilentAccess() delegates to navigator.credentials.preventSilentAccess", async () => {
    const preventSilentAccess = vi.fn<() => Promise<undefined>>().mockResolvedValue(undefined);
    setNavigatorCredentials({
      create: () => Promise.resolve(null),
      get: () => Promise.resolve(null),
      preventSilentAccess,
      store: () => Promise.resolve(undefined),
    });

    const { result } = renderHook(() => useCredential());
    await result.current.preventSilentAccess();

    expect(preventSilentAccess).toHaveBeenCalled();
  });

  it("preventSilentAccess() no-ops when unsupported", async () => {
    setNavigatorCredentials(undefined);

    const { result } = renderHook(() => useCredential());

    await expect(result.current.preventSilentAccess()).resolves.toBeUndefined();
  });
});
