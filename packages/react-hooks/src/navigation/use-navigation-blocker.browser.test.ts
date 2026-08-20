import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Navigation, NavigateEvent } from "./_navigation-api.ts";

import { useNavigationBlocker } from "./use-navigation-blocker.ts";

function createNavigationMock() {
  const listeners = new Map<string, (event: NavigateEvent) => void>();

  const nav = {
    addEventListener: vi.fn((type: string, listener: (event: NavigateEvent) => void) => {
      listeners.set(type, listener);
    }),
    removeEventListener: vi.fn((type: string) => {
      listeners.delete(type);
    }),
  } as unknown as Navigation;

  return {
    fireNavigate: (event: NavigateEvent) => listeners.get("navigate")?.(event),
    nav,
  };
}

function fakeNavigateEvent(overrides: Partial<NavigateEvent> = {}): NavigateEvent {
  return {
    canIntercept: true,
    destination: { url: "/next" },
    downloadRequest: null,
    hashChange: false,
    intercept: vi.fn(),
    ...overrides,
  } as unknown as NavigateEvent;
}

function setWindowNavigation(nav: Navigation | undefined) {
  Object.defineProperty(window, "navigation", {
    configurable: true,
    get: () => nav,
  });
}

describe(useNavigationBlocker, () => {
  it("blocks and intercepts when shouldBlock returns true", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const event = fakeNavigateEvent();

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    expect(event.intercept).toHaveBeenCalledTimes(1);
    expect(result.current.blocked).toBe(true);
  });

  it("does not block when shouldBlock returns false", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const event = fakeNavigateEvent();

    const { result } = renderHook(() => useNavigationBlocker(() => false));

    act(() => {
      fireNavigate(event);
    });

    expect(event.intercept).not.toHaveBeenCalled();
    expect(result.current.blocked).toBe(false);
  });

  it("ignores events that cannot be intercepted", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const event = fakeNavigateEvent({ canIntercept: false });

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    expect(event.intercept).not.toHaveBeenCalled();
    expect(result.current.blocked).toBe(false);
  });

  it("ignores hash-only changes", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const event = fakeNavigateEvent({ hashChange: true });

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    expect(event.intercept).not.toHaveBeenCalled();
    expect(result.current.blocked).toBe(false);
  });

  it("ignores download requests", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const event = fakeNavigateEvent({ downloadRequest: "file.zip" });

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    expect(event.intercept).not.toHaveBeenCalled();
    expect(result.current.blocked).toBe(false);
  });

  it("passes the destination URL to shouldBlock", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const shouldBlock = vi.fn(() => false);
    const event = fakeNavigateEvent({ destination: { url: "/somewhere" } as never });

    renderHook(() => useNavigationBlocker(shouldBlock));

    act(() => {
      fireNavigate(event);
    });

    expect(shouldBlock).toHaveBeenCalledWith("/somewhere");
  });

  it("proceed() resolves the pending navigation and unblocks", async () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const event = fakeNavigateEvent();

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    const interceptMock = event.intercept as unknown as ReturnType<typeof vi.fn>;
    const options = interceptMock.mock.calls[0]?.[0] as { handler: () => Promise<void> };
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
    const event = fakeNavigateEvent();

    const { result } = renderHook(() => useNavigationBlocker(() => true));

    act(() => {
      fireNavigate(event);
    });

    const interceptMock = event.intercept as unknown as ReturnType<typeof vi.fn>;
    const options = interceptMock.mock.calls[0]?.[0] as { handler: () => Promise<void> };
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
    const { nav } = createNavigationMock();
    setWindowNavigation(nav);

    const { unmount } = renderHook(() => useNavigationBlocker(() => true));
    unmount();

    expect(nav.removeEventListener).toHaveBeenCalledWith("navigate", expect.any(Function));
  });

  it("uses the latest shouldBlock without re-subscribing", () => {
    const { nav, fireNavigate } = createNavigationMock();
    setWindowNavigation(nav);
    const event = fakeNavigateEvent();

    const { rerender, result } = renderHook(
      ({ shouldBlock }: { shouldBlock: (url: string) => boolean }) =>
        useNavigationBlocker(shouldBlock),
      { initialProps: { shouldBlock: (): boolean => false } },
    );

    rerender({ shouldBlock: () => true });

    act(() => {
      fireNavigate(event);
    });

    expect(nav.addEventListener).toHaveBeenCalledTimes(1);
    expect(result.current.blocked).toBe(true);
  });
});
