import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePermission } from "./use-permission.ts";

function createPermissionStatusMock(initialState: PermissionState) {
  const status: PermissionStatus = new EventTarget();
  let state = initialState;

  Object.defineProperty(status, "state", { configurable: true, get: () => state });

  return {
    setState: (next: PermissionState) => {
      state = next;
      status.dispatchEvent(new Event("change"));
    },
    status,
  };
}

function setNavigatorPermissions(
  query: ((descriptor: PermissionDescriptor) => Promise<PermissionStatus>) | undefined,
) {
  Object.defineProperty(navigator, "permissions", {
    configurable: true,
    value: query ? { query } : undefined,
  });
}

describe(usePermission, () => {
  it("starts undefined before the query resolves", () => {
    setNavigatorPermissions(() => new Promise(() => {}));

    const { result } = renderHook(() => usePermission("geolocation"));

    expect(result.current).toBeUndefined();
  });

  it("reports the resolved permission state", async () => {
    const { status } = createPermissionStatusMock("prompt");
    setNavigatorPermissions(() => Promise.resolve(status));

    const { result } = renderHook(() => usePermission("geolocation"));

    await waitFor(() => expect(result.current).toBe("prompt"));
  });

  it("updates when the permission state changes", async () => {
    const { setState, status } = createPermissionStatusMock("prompt");
    setNavigatorPermissions(() => Promise.resolve(status));

    const { result } = renderHook(() => usePermission("geolocation"));
    await waitFor(() => expect(result.current).toBe("prompt"));

    await act(async () => {
      setState("granted");
    });

    expect(result.current).toBe("granted");
  });

  it("queries again when the permission name changes", async () => {
    const query = vi.fn((descriptor: PermissionDescriptor) =>
      Promise.resolve(
        createPermissionStatusMock("granted").status as PermissionStatus & { name: string },
      ),
    );
    setNavigatorPermissions(query);

    const { rerender } = renderHook(({ name }) => usePermission(name), {
      initialProps: { name: "geolocation" as PermissionName },
    });

    await waitFor(() => expect(query).toHaveBeenCalledTimes(1));

    rerender({ name: "camera" as PermissionName });

    await waitFor(() => expect(query).toHaveBeenCalledTimes(2));
    expect(query.mock.calls[1]?.[0]).toEqual({ name: "camera" });
  });

  it("stays undefined when the Permissions API is unsupported", () => {
    setNavigatorPermissions(undefined);

    const { result } = renderHook(() => usePermission("geolocation"));

    expect(result.current).toBeUndefined();
  });
});
