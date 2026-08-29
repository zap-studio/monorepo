import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { usePermission } from "./use-permission.ts";

/** `renderHook` props for the re-query test, typed so a later `rerender` can pass another name. */
interface PermissionNameProps {
  name: PermissionName;
}

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
    const query = vi.fn<(_descriptor: PermissionDescriptor) => Promise<PermissionStatus>>(
      (_descriptor: PermissionDescriptor) =>
        Promise.resolve(createPermissionStatusMock("granted").status),
    );
    setNavigatorPermissions(query);

    const initialProps: PermissionNameProps = { name: "geolocation" };
    const { rerender } = renderHook(({ name }) => usePermission(name), { initialProps });

    await waitFor(() => expect(query).toHaveBeenCalledTimes(1));

    rerender({ name: "camera" });

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
