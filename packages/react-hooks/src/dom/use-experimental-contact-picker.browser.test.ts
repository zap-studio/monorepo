import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useExperimentalContactPicker } from "./use-experimental-contact-picker.ts";

const abortError = (): Error => {
  const error = new Error("The user aborted the request.");
  error.name = "AbortError";
  return error;
};

const setNavigatorContacts = (
  contacts:
    | {
        getProperties: () => Promise<string[]>;
        select: (properties: string[], options?: { multiple?: boolean }) => Promise<unknown[]>;
      }
    | undefined,
) => {
  Object.defineProperty(navigator, "contacts", { configurable: true, value: contacts });
};

describe("useExperimentalContactPicker", () => {
  it("reports supported: false when navigator.contacts is unavailable", () => {
    setNavigatorContacts(undefined);

    const { result } = renderHook(() => useExperimentalContactPicker());

    expect(result.current.supported).toBe(false);
  });

  it("reports supported: true when navigator.contacts exists", () => {
    setNavigatorContacts({
      getProperties: () => Promise.resolve([]),
      select: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useExperimentalContactPicker());

    expect(result.current.supported).toBe(true);
  });

  it("select() forwards properties/options and resolves the chosen contacts", async () => {
    const select = vi.fn().mockResolvedValue([{ name: ["Ada Lovelace"] }]);
    setNavigatorContacts({ getProperties: () => Promise.resolve([]), select });

    const { result } = renderHook(() => useExperimentalContactPicker());

    await expect(result.current.select(["name", "email"], { multiple: true })).resolves.toEqual([
      { name: ["Ada Lovelace"] },
    ]);
    expect(select).toHaveBeenCalledWith(["name", "email"], { multiple: true });
  });

  it("select() resolves undefined when the user cancels", async () => {
    setNavigatorContacts({
      getProperties: () => Promise.resolve([]),
      select: () => Promise.reject(abortError()),
    });

    const { result } = renderHook(() => useExperimentalContactPicker());

    await expect(result.current.select(["name"])).resolves.toBeUndefined();
  });

  it("select() rethrows non-abort errors", async () => {
    setNavigatorContacts({
      getProperties: () => Promise.resolve([]),
      select: () => Promise.reject(new Error("permission error")),
    });

    const { result } = renderHook(() => useExperimentalContactPicker());

    await expect(result.current.select(["name"])).rejects.toThrow("permission error");
  });

  it("select() resolves undefined when unsupported", async () => {
    setNavigatorContacts(undefined);

    const { result } = renderHook(() => useExperimentalContactPicker());

    await expect(result.current.select(["name"])).resolves.toBeUndefined();
  });

  it("getProperties() delegates to navigator.contacts.getProperties", async () => {
    setNavigatorContacts({
      getProperties: () => Promise.resolve(["name", "email"]),
      select: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useExperimentalContactPicker());

    await expect(result.current.getProperties()).resolves.toEqual(["name", "email"]);
  });

  it("getProperties() resolves undefined when unsupported", async () => {
    setNavigatorContacts(undefined);

    const { result } = renderHook(() => useExperimentalContactPicker());

    await expect(result.current.getProperties()).resolves.toBeUndefined();
  });
});
