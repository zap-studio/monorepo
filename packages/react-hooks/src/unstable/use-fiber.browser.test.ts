import { render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useFiber, type UseFiberResult } from "./use-fiber.ts";

function renderFiberDiv(props: { label: string }) {
  let latest!: UseFiberResult<HTMLDivElement>;
  function TestComponent({ label }: { label: string }) {
    latest = useFiber<HTMLDivElement>();
    return createElement("div", { ref: latest.ref }, label);
  }
  const { rerender, unmount } = render(createElement(TestComponent, props));
  return {
    get current() {
      return latest;
    },
    rerender: (nextProps: { label: string }) => rerender(createElement(TestComponent, nextProps)),
    unmount,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(useFiber, () => {
  it("starts with fiber: null before mount", () => {
    const { result } = renderHook(() => useFiber());

    expect(result.current.fiber).toBeNull();
  });

  it("finds the owning function-component fiber for a ref'd DOM element", () => {
    const view = renderFiberDiv({ label: "hello" });

    expect(view.current.fiber).not.toBeNull();
    expect(typeof view.current.fiber?.type).toBe("function");
    expect(view.current.fiber?.memoizedProps).toEqual({ label: "hello" });
  });

  it("reflects updated memoizedProps after a re-render", () => {
    const view = renderFiberDiv({ label: "a" });
    expect(view.current.fiber?.memoizedProps).toEqual({ label: "a" });

    view.rerender({ label: "b" });

    expect(view.current.fiber?.memoizedProps).toEqual({ label: "b" });
  });

  it("returns null for a DOM node react-dom never mounted", () => {
    const { rerender, result } = renderHook(() => useFiber<HTMLDivElement>());
    result.current.ref.current = document.createElement("div");

    rerender();

    expect(result.current.fiber).toBeNull();
  });

  it("fails closed to null when reading the internal shape throws", () => {
    const throwing = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("boom");
        },
      },
    ) as unknown as HTMLDivElement;

    const { rerender, result } = renderHook(() => useFiber<HTMLDivElement>());
    result.current.ref.current = throwing;

    expect(() => rerender()).not.toThrow();
    expect(result.current.fiber).toBeNull();
  });

  it("no-ops (fiber: null) in production builds", () => {
    vi.stubGlobal("process", { env: { NODE_ENV: "production" } });

    const view = renderFiberDiv({ label: "hello" });

    expect(view.current.fiber).toBeNull();
  });
});
