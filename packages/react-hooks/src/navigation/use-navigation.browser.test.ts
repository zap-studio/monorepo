import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useNavigation } from "./use-navigation.ts";

// SAFETY: one place to cast test doubles and fake fixtures to a type they do not
// fully match. This keeps `as unknown as X` chains out of the test body.
const asTestDouble = <T>(value: unknown): T => value as T;

interface MockState {
  canGoBack: boolean;
  canGoForward: boolean;
  currentEntry: NavigationHistoryEntry | null;
  entries: NavigationHistoryEntry[];
}

const createNavigationMock = (initial: MockState) => {
  const target = new EventTarget();
  let state = { ...initial };

  Object.defineProperties(target, {
    canGoBack: { configurable: true, get: () => state.canGoBack },
    canGoForward: { configurable: true, get: () => state.canGoForward },
    currentEntry: { configurable: true, get: () => state.currentEntry },
    entries: { configurable: true, value: () => state.entries },
  });
  // SAFETY: the Object.defineProperties call above added canGoBack, canGoForward, currentEntry, and entries. These are exactly the members Navigation adds on top of EventTarget, so this EventTarget now has every property that readNavigation and subscribe in use-navigation.ts touch.
  const nav = asTestDouble<Navigation>(target);

  return {
    nav,
    setState: (next: Partial<MockState>) => {
      state = { ...state, ...next };
      nav.dispatchEvent(new Event("currententrychange"));
    },
  };
};

const setWindowNavigation = (nav: Navigation | undefined) => {
  Object.defineProperty(window, "navigation", {
    configurable: true,
    get: () => nav,
  });
};

const fakeEntry = (url: string): NavigationHistoryEntry => {
  // SAFETY: NavigationHistoryEntry only declares a readonly `url` field, and this object provides it. readNavigation and these tests only compare entries by reference or read `.url`, never any other member.
  return asTestDouble<NavigationHistoryEntry>({ url });
};

describe("useNavigation", () => {
  it("reports the current navigation state", () => {
    const entryA = fakeEntry("/a");
    const { nav } = createNavigationMock({
      canGoBack: false,
      canGoForward: true,
      currentEntry: entryA,
      entries: [entryA],
    });
    setWindowNavigation(nav);

    const { result } = renderHook(() => useNavigation());

    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(true);
    expect(result.current.currentEntry).toBe(entryA);
    expect(result.current.entries).toEqual([entryA]);
  });

  it("reports currentEntry as null when the Navigation API reports null", () => {
    const { nav } = createNavigationMock({
      canGoBack: false,
      canGoForward: false,
      currentEntry: null,
      entries: [],
    });
    setWindowNavigation(nav);

    const { result } = renderHook(() => useNavigation());

    expect(result.current.currentEntry).toBeNull();
  });

  it("updates on currententrychange", async () => {
    const entryA = fakeEntry("/a");
    const entryB = fakeEntry("/b");
    const { nav, setState } = createNavigationMock({
      canGoBack: false,
      canGoForward: false,
      currentEntry: entryA,
      entries: [entryA],
    });
    setWindowNavigation(nav);

    const { result } = renderHook(() => useNavigation());

    await act(async () => {
      setState({ canGoBack: true, currentEntry: entryB, entries: [entryA, entryB] });
    });

    expect(result.current.canGoBack).toBe(true);
    expect(result.current.currentEntry).toBe(entryB);
    expect(result.current.entries).toEqual([entryA, entryB]);
  });

  it("updates when only the entries list changes (same length)", async () => {
    const entryA = fakeEntry("/a");
    const entryB = fakeEntry("/b");
    const entryC = fakeEntry("/c");
    const { nav, setState } = createNavigationMock({
      canGoBack: false,
      canGoForward: false,
      currentEntry: entryA,
      entries: [entryA, entryB],
    });
    setWindowNavigation(nav);

    const { result } = renderHook(() => useNavigation());

    await act(async () => {
      setState({ entries: [entryA, entryC] });
    });

    expect(result.current.entries).toEqual([entryA, entryC]);
  });

  it("returns the same reference when nothing changed", async () => {
    const entryA = fakeEntry("/a");
    const entryB = fakeEntry("/b");
    const { nav, setState } = createNavigationMock({
      canGoBack: false,
      canGoForward: false,
      currentEntry: entryA,
      entries: [entryA, entryB],
    });
    setWindowNavigation(nav);

    const { result } = renderHook(() => useNavigation());
    const first = result.current;

    await act(async () => {
      setState({});
    });

    expect(result.current).toBe(first);
  });

  it("falls back to the empty snapshot when the Navigation API is unsupported", () => {
    setWindowNavigation(undefined);

    const { result, unmount } = renderHook(() => useNavigation());

    expect(result.current).toEqual({
      canGoBack: false,
      canGoForward: false,
      currentEntry: null,
      entries: [],
    });
    unmount();
  });

  it("removes the currententrychange listener on unmount", async () => {
    const entryA = fakeEntry("/a");
    const { nav, setState } = createNavigationMock({
      canGoBack: false,
      canGoForward: false,
      currentEntry: entryA,
      entries: [entryA],
    });
    setWindowNavigation(nav);

    const { result, unmount } = renderHook(() => useNavigation());
    const before = result.current;
    unmount();

    await act(async () => {
      setState({ canGoBack: true });
    });

    expect(result.current).toBe(before);
  });
});
