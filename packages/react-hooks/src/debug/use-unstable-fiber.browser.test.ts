import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { renderHook } from "../../tests/_react.ts";
import { asTestDouble } from "../../tests/_test-double.ts";
import { useUnstableFiber, type UseUnstableFiberResult } from "./use-unstable-fiber.ts";

/**
 * `fiber` reflects the DOM ref from the *previous* commit (documented,
 * matching every ref-based hook in this package), so a freshly-mounted
 * component's very first render always reads `fiber: null` — the ref
 * only attaches during that render's own commit. Renders once, then
 * "settles" with a same-props re-render so the ref has a commit to read.
 */
const renderFiberDiv = async (props: { label: string }) => {
  let latest!: UseUnstableFiberResult<HTMLDivElement>;
  const TestComponent = ({ label }: { label: string }) => {
    latest = useUnstableFiber<HTMLDivElement>();
    return createElement("div", { ref: latest.ref }, label);
  };
  const { rerender, unmount } = await render(createElement(TestComponent, props));
  await rerender(createElement(TestComponent, props));
  return {
    get current() {
      return latest;
    },
    rerender: async (nextProps: { label: string }) =>
      await rerender(createElement(TestComponent, nextProps)),
    unmount,
  };
};

describe("useUnstableFiber", () => {
  it("starts with fiber: null before mount", async () => {
    const { result } = await renderHook(() => useUnstableFiber());

    expect(result.current.fiber).toBeNull();
  });

  it("finds the owning function-component fiber for a ref'd DOM element", async () => {
    const view = await renderFiberDiv({ label: "hello" });

    expect(view.current.fiber).not.toBeNull();
    expect(typeof view.current.fiber?.type).toBe("function");
    expect(view.current.fiber?.memoizedProps).toEqual({ label: "hello" });
  });

  it("reflects updated memoizedProps after a re-render", async () => {
    const view = await renderFiberDiv({ label: "a" });
    expect(view.current.fiber?.memoizedProps).toEqual({ label: "a" });

    await view.rerender({ label: "b" });
    await view.rerender({ label: "b" });

    expect(view.current.fiber?.memoizedProps).toEqual({ label: "b" });
  });

  it("returns null for a DOM node react-dom never mounted", async () => {
    const { rerender, result } = await renderHook(() => useUnstableFiber<HTMLDivElement>());
    result.current.ref.current = document.createElement("div");

    await rerender();

    expect(result.current.fiber).toBeNull();
  });

  it("fails closed to null when reading the internal shape throws", async () => {
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

    const { rerender, result } = await renderHook(() => useUnstableFiber<HTMLDivElement>());
    result.current.ref.current = throwing;

    expect(async () => await rerender()).not.toThrow();
    expect(result.current.fiber).toBeNull();
  });

  it("returns the host fiber itself when no function-component ancestor exists", async () => {
    const fakeFiber = {
      alternate: null,
      dependencies: null,
      memoizedProps: {},
      memoizedState: null,
      return: null,
      type: "div",
    };
    const element = asTestDouble<Record<string, unknown>>(document.createElement("div"));
    element["__reactFiber$fake"] = fakeFiber;

    const { rerender, result } = await renderHook(() => useUnstableFiber<HTMLDivElement>());
    result.current.ref.current = asTestDouble<HTMLDivElement>(element);
    await rerender();

    expect(result.current.fiber).toBe(fakeFiber);
  });
});

describe("useUnstableFiber ref tracking", () => {
  it("resolves the fiber without an extra manual re-render", async () => {
    let latest!: UseUnstableFiberResult<HTMLDivElement>;
    const TestComponent = () => {
      latest = useUnstableFiber<HTMLDivElement>();
      return createElement("div", { ref: latest.ref });
    };
    await render(createElement(TestComponent));

    expect(latest.fiber).not.toBeNull();
  });
});
