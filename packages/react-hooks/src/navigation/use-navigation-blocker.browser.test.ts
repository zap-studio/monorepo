import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Navigation, NavigateEvent } from "./_navigation-api.ts";

import { useNavigationBlocker } from "./use-navigation-blocker.ts";

// SAFETY: single explicit escape hatch for casting test doubles / deliberately
// non-conforming fixtures to a type they don't structurally satisfy, instead of
// scattering `as unknown as X` chains through the test body.
const asTestDouble = <T>(value: unknown): T => value as T;

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

  // SAFETY: this fake implements only addEventListener/removeEventListener, the two
  // members the hook actually reads from `nav` (see use-navigation-blocker.ts).
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

  // SAFETY: this fake exposes exactly the members handleNavigate reads
  // (canIntercept, hashChange, downloadRequest, destination.url, intercept) —
  // see use-navigation-blocker.ts.
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
    // so a partial override with just `url` is sufficient even though it doesn't satisfy
    // the full NavigateDestination shape.
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

    // SAFETY: the act() block above triggered handleNavigate, which calls
    // `navigateEvent.intercept({ handler: waitForProceed })` exactly once, so
    // mock.calls[0][0] is that { handler } object passed by the hook.
    const options = intercept.mock.calls[0]?.[0] as { handler: () => Promise<void> };
    let settled = false;
    const pending = options.handler().then(() => {
      settled = true;
    });

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

    // SAFETY: the act() block above triggered handleNavigate, which calls
    // `navigateEvent.intercept({ handler: waitForProceed })` exactly once, so
    // mock.calls[0][0] is that { handler } object passed by the hook.
    const options = intercept.mock.calls[0]?.[0] as { handler: () => Promise<void> };
    let settled = false;
    void options.handler().then(() => {
      settled = true;
    });

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
