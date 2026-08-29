import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { usePermission } from "./use-permission.ts";

const createPermissionStatusMock = (initialState: PermissionState) => {
  // SAFETY: usePermission only calls status.addEventListener/removeEventListener, which are native EventTarget methods, and reads status.state, defined just below with Object.defineProperty. So this EventTarget has every member the hook uses on a PermissionStatus.
  const status = asTestDouble<PermissionStatus>(new EventTarget());
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
        // SAFETY: the `& { name: string }` part only matches the return type this query mock declares. usePermission never reads `.name` on the resolved status. It only reads `.state` and calls add/removeEventListener, which createPermissionStatusMock's status already has.
        createPermissionStatusMock("granted").status as PermissionStatus & { name: string },
      ),
    );
    setNavigatorPermissions(query);

    // SAFETY: "geolocation" is one of the PermissionName values from the DOM lib. usePermission passes `name` straight into permissions.query({ name }). Widening the literal to a union it is already part of changes nothing at runtime.
    const { rerender } = renderHook(({ name }) => usePermission(name), {
      initialProps: { name: "geolocation" as PermissionName },
    });

    await waitFor(() => expect(query).toHaveBeenCalledTimes(1));

    // SAFETY: "camera" is also a real PermissionName value. usePermission only queries again with it as a plain string, so the cast hides no wrong runtime shape.
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
