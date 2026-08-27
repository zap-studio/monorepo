import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePermission } from "./use-permission.ts";

const createPermissionStatusMock = (initialState: PermissionState) => {
  // SAFETY: usePermission only calls status.addEventListener/removeEventListener (native EventTarget methods) and reads status.state (defined right below via Object.defineProperty), so this EventTarget already provides every member the hook touches on a PermissionStatus.
  const status = new EventTarget() as unknown as PermissionStatus;
  let state = initialState;

  Object.defineProperty(status, "state", { configurable: true, get: () => state });

  return {
    setState: (next: PermissionState) => {
      state = next;
      status.dispatchEvent(new Event("change"));
    },
    status,
  };
};

const setNavigatorPermissions = (
  query: ((descriptor: PermissionDescriptor) => Promise<PermissionStatus>) | undefined,
) => {
  Object.defineProperty(navigator, "permissions", {
    configurable: true,
    value: query ? { query } : undefined,
  });
};

describe("usePermission", () => {
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
    const query = vi.fn<
      (_descriptor: PermissionDescriptor) => Promise<PermissionStatus & { name: string }>
    >((_descriptor: PermissionDescriptor) =>
      Promise.resolve(
        // SAFETY: the `& { name: string }` intersection only satisfies this query mock's declared return type; usePermission never reads `.name` off the resolved status, only `.state` and add/removeEventListener, all of which createPermissionStatusMock's status already provides.
        createPermissionStatusMock("granted").status as PermissionStatus & { name: string },
      ),
    );
    setNavigatorPermissions(query);

    // SAFETY: "geolocation" is one of the DOM lib's own PermissionName union members; usePermission only forwards `name` unchanged into permissions.query({ name }), so widening this literal to the union type it already belongs to changes nothing at runtime.
    const { rerender } = renderHook(({ name }) => usePermission(name), {
      initialProps: { name: "geolocation" as PermissionName },
    });

    await waitFor(() => expect(query).toHaveBeenCalledTimes(1));

    // SAFETY: "camera" is likewise a real PermissionName union member, and usePermission only re-queries with this value as an opaque string, so the cast doesn't paper over a mismatched runtime shape.
    rerender({ name: "camera" as PermissionName });

    await waitFor(() => expect(query).toHaveBeenCalledTimes(2));
    expect(query.mock.calls[1]?.[0]).toEqual({ name: "camera" });
  });

  it("stays undefined when the Permissions API is unsupported", () => {
    setNavigatorPermissions(undefined);

    const { result } = renderHook(() => usePermission("geolocation"));

    expect(result.current).toBeUndefined();
  });

  it("ignores a resolved query if the component unmounted first", async () => {
    let resolveQuery!: (status: PermissionStatus) => void;
    const queryPromise = new Promise<PermissionStatus>((resolve) => {
      resolveQuery = resolve;
    });
    setNavigatorPermissions(() => queryPromise);

    const { unmount } = renderHook(() => usePermission("geolocation"));
    unmount();

    const { status } = createPermissionStatusMock("granted");
    const addEventListener = vi.spyOn(status, "addEventListener");

    await act(async () => {
      resolveQuery(status);
      await queryPromise;
    });

    expect(addEventListener).not.toHaveBeenCalled();
  });
});
