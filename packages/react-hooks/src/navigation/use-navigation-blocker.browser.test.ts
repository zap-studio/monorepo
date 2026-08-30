import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { useNavigationBlocker } from "./use-navigation-blocker.ts";

const createNavigationMock = () => {
  const listeners = new Map<string, (event: NavigateEvent) => void>();

  const addEventListener = vi.fn<(type: string, listener: (event: NavigateEvent) => void) => void>(
    (type: string, listener: (event: NavigateEvent) => void) => {
      listeners.set(type, listener);
    },
  );
  const removeEventListener = vi.fn<(type: string) => void>((type: string) => {
    listeners.delete(type);
  });

  const nav = asTestDouble<Navigation>({
    addEventListener,
    removeEventListener,
  });

  return {
    addEventListener,
    fireNavigate: (event: NavigateEvent) => listeners.get("navigate")?.(event),
    nav,
    removeEventListener,
  };
};

const fakeNavigateEvent = (overrides: Partial<NavigateEvent> = {}) => {
  const intercept = vi.fn<(options: { handler: () => Promise<void> }) => void>();

  const event = asTestDouble<NavigateEvent>({
    canIntercept: true,
    destination: { url: "/next" },
    downloadRequest: null,
    hashChange: false,
    intercept,
    ...overrides,
  });

  return { event, intercept };
};

const setWindowNavigation = (nav: Navigation | undefined) => {
  Object.defineProperty(window, "navigation", {
    configurable: true,
    get: () => nav,
  });
};

describe("useNavigationBlocker", () => {
  it("blocks and intercepts when shouldBlock returns true", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const { event, intercept } = fakeNavigateEvent();

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    expect(intercept).toHaveBeenCalledTimes(1);
    expect(result.current.blocked).toBe(true);
  });

  it("does not block when shouldBlock returns false", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const { event, intercept } = fakeNavigateEvent();

    const { result } = renderHook(() => useNavigationBlocker(() => false));

    act(() => {
      fireNavigate(event);
    });

    expect(intercept).not.toHaveBeenCalled();
    expect(result.current.blocked).toBe(false);
  });

  it("ignores events that cannot be intercepted", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const { event, intercept } = fakeNavigateEvent({ canIntercept: false });

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    expect(intercept).not.toHaveBeenCalled();
    expect(result.current.blocked).toBe(false);
  });

  it("ignores hash-only changes", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const { event, intercept } = fakeNavigateEvent({ hashChange: true });

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    expect(intercept).not.toHaveBeenCalled();
    expect(result.current.blocked).toBe(false);
  });

  it("ignores download requests", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const { event, intercept } = fakeNavigateEvent({ downloadRequest: "file.zip" });

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    expect(intercept).not.toHaveBeenCalled();
    expect(result.current.blocked).toBe(false);
  });

  it("passes the destination URL to shouldBlock", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const shouldBlock = vi.fn<() => boolean>(() => false);
    // SAFETY: handleNavigate only reads destination.url (see use-navigation-blocker.ts),
    // so an override with just `url` is enough. It does not match the full
    // NavigateDestination shape.
    const { event } = fakeNavigateEvent({ destination: { url: "/somewhere" } as never });

    renderHook(() => useNavigationBlocker(shouldBlock));

    act(() => {
      fireNavigate(event);
    });

    expect(shouldBlock).toHaveBeenCalledWith("/somewhere");
  });

  it("proceed() resolves the pending navigation and unblocks", async () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const { event, intercept } = fakeNavigateEvent();

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    const [options] = intercept.mock.calls[0] ?? [];
    let settled = false;
    const pending = (async () => {
      await options?.handler();
      settled = true;
    })();

    expect(settled).toBe(false);

    act(() => {
      result.current.proceed();
    });
    await pending;

    expect(settled).toBe(true);
    expect(result.current.blocked).toBe(false);
  });

  it("reset() unblocks without resolving the pending navigation", async () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const { event, intercept } = fakeNavigateEvent();

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    const [options] = intercept.mock.calls[0] ?? [];
    let settled = false;
    void (async () => {
      await options?.handler();
      settled = true;
    })();

    act(() => {
      result.current.reset();
    });
    await Promise.resolve();

    expect(settled).toBe(false);
    expect(result.current.blocked).toBe(false);
  });

  it("proceed() is a no-op when nothing is blocked", () => {
    const { nav } = createNavigationMock();
    setWindowNavigation(nav);

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      result.current.proceed();
    });

    expect(result.current.blocked).toBe(false);
  });

  it("does nothing when the Navigation API is unsupported", () => {
    setWindowNavigation(undefined);

    const { result, unmount } = renderHook(() => useNavigationBlocker(() => true));

    expect(result.current.blocked).toBe(false);
    act(() => {
      result.current.proceed();
      result.current.reset();
    });
    expect(result.current.blocked).toBe(false);
    unmount();
  });

  it("removes the navigate listener on unmount", () => {
    const { nav, removeEventListener } = createNavigationMock();
    setWindowNavigation(nav);

    const { unmount } = renderHook(() => useNavigationBlocker(() => true));
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("navigate", expect.any(Function));
  });

  it("uses the latest shouldBlock without re-subscribing", () => {
    const { addEventListener, fireNavigate, nav } = createNavigationMock();
    setWindowNavigation(nav);
    const { event } = fakeNavigateEvent();

    const { rerender, result } = renderHook(
      ({ shouldBlock }: { shouldBlock: (url: string) => boolean }) =>
        useNavigationBlocker(shouldBlock),
      { initialProps: { shouldBlock: (): boolean => false } },
    );

    rerender({ shouldBlock: () => true });

    act(() => {
      fireNavigate(event);
    });

    expect(addEventListener).toHaveBeenCalledTimes(1);
    expect(result.current.blocked).toBe(true);
  });
});
