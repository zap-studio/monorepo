import { render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { useUnstableFiber, type UseUnstableFiberResult } from "./use-unstable-fiber.ts";

// SAFETY: one place to cast test doubles and fake fixtures to a type they do not
// fully match. This keeps `as unknown as X` chains out of the test body.
const asTestDouble = <T>(value: unknown): T => value as T;

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

describe("useUnstableFiber", () => {
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
    // SAFETY: readHostFiber calls Object.keys(node) first. That runs this Proxy's ownKeys trap and throws before any other Element member is touched, so the Proxy never needs to act like a real HTMLDivElement. useUnstableFiber's try/catch catches the error and returns fiber: null, which is what this test checks.
    const throwing = asTestDouble<HTMLDivElement>(
      new Proxy(
        {},
        {
          ownKeys() {
            throw new Error("boom");
          },
        },
      ),
    );

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
    // SAFETY: this is a real DOM div from document.createElement. Casting to Record<string, unknown> only lets us assign any string key (`__reactFiber$fake`), the same way React attaches its private Fiber pointer, which getReactFiberKey in _fiber.ts looks for with Object.keys.
    const element = asTestDouble<Record<string, unknown>>(document.createElement("div"));
    element["__reactFiber$fake"] = fakeFiber;

    const { rerender, result } = renderHook(() => useUnstableFiber<HTMLDivElement>());
    // SAFETY: `element` is the same document.createElement("div") result from above, now carrying `__reactFiber$fake`. It already is an HTMLDivElement, so this cast just restores that type after the Record<string, unknown> widening two lines up.
    result.current.ref.current = asTestDouble<HTMLDivElement>(element);
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
