import { render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { useUnstableFiber, type UseUnstableFiberResult } from "./use-unstable-fiber.ts";

/**
 * `fiber` reflects the DOM ref from the *previous* commit (documented,
 * matching every ref-based hook in this package), so a freshly-mounted
 * component's very first render always reads `fiber: null` — the ref
 * only attaches during that render's own commit. Renders once, then
 * "settles" with a same-props re-render so the ref has a commit to read.
 */
const renderFiberDiv = (props: { label: string }) => {
  let latest!: UseUnstableFiberResult<HTMLDivElement>;
  const TestComponent = ({ label }: { label: string }) => {
    latest = useUnstableFiber<HTMLDivElement>();
    return createElement("div", { ref: latest.ref }, label);
  };
  const { rerender, unmount } = render(createElement(TestComponent, props));
  rerender(createElement(TestComponent, props));
  return {
    get current() {
      return latest;
    },
    rerender: (nextProps: { label: string }) => rerender(createElement(TestComponent, nextProps)),
    unmount,
  };
};

describe(useUnstableFiber, () => {
  it("starts with fiber: null before mount", () => {
    const { result } = renderHook(() => useUnstableFiber());

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
    view.rerender({ label: "b" });

    expect(view.current.fiber?.memoizedProps).toEqual({ label: "b" });
  });

  it("returns null for a DOM node react-dom never mounted", () => {
    const { rerender, result } = renderHook(() => useUnstableFiber<HTMLDivElement>());
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

    const { rerender, result } = renderHook(() => useUnstableFiber<HTMLDivElement>());
    result.current.ref.current = throwing;

    expect(() => rerender()).not.toThrow();
    expect(result.current.fiber).toBeNull();
  });

  it("returns the host fiber itself when no function-component ancestor exists", () => {
    const fakeFiber = {
      alternate: null,
      dependencies: null,
      memoizedProps: {},
      memoizedState: null,
      return: null,
      type: "div",
    };
    const element = document.createElement("div") as unknown as Record<string, unknown>;
    element["__reactFiber$fake"] = fakeFiber;

    const { rerender, result } = renderHook(() => useUnstableFiber<HTMLDivElement>());
    result.current.ref.current = element as unknown as HTMLDivElement;
    rerender();

    expect(result.current.fiber).toBe(fakeFiber);
  });
});

describe("useUnstableFiber ref tracking", () => {
  it("resolves the fiber without an extra manual re-render", () => {
    let latest!: UseUnstableFiberResult<HTMLDivElement>;
    const TestComponent = () => {
      latest = useUnstableFiber<HTMLDivElement>();
      return createElement("div", { ref: latest.ref });
    };
    render(createElement(TestComponent));

    expect(latest.fiber).not.toBeNull();
  });
});
