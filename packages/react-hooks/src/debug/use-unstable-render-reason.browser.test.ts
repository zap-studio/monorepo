import { createContext, createElement, useContext, useRef, useState } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { act, renderHook } from "../../tests/_react.ts";
import { asTestDouble } from "../../tests/_test-double.ts";
import { useUnstableRenderReason, type RenderReason } from "./use-unstable-render-reason.ts";

const TestContext = createContext("default");

interface ChildHandle {
  reason: RenderReason;
  setCount: (value: number) => void;
}

const renderChild = async (props: { label: string }) => {
  let latest!: ChildHandle;
  const Child = ({ label }: { label: string }) => {
    const { reason, ref } = useUnstableRenderReason<HTMLDivElement>();
    // A non-dispatch-capable hook (no `.queue`) called after useUnstableRenderReason, alongside the useState below — exercises both sides of collectStateHookValues' per-node filter.
    useRef(null);
    const [count, setCount] = useState(0);
    const contextValue = useContext(TestContext);
    latest = { reason, setCount };
    return createElement("div", { ref }, `${label}-${count}-${contextValue}`);
  };

  const { rerender } = await render(createElement(Child, props));
  return {
    get current() {
      return latest;
    },
    rerender: async (nextProps: { label: string }) =>
      await rerender(createElement(Child, nextProps)),
  };
};

const renderChildWithContext = async (props: { label: string }, contextValue: string) => {
  let latest!: ChildHandle;
  const Child = ({ label }: { label: string }) => {
    const { reason, ref } = useUnstableRenderReason<HTMLDivElement>();
    const value = useContext(TestContext);
    latest = { reason, setCount: () => {} };
    return createElement("div", { ref }, `${label}-${value}`);
  };

  const wrap = (elementProps: { label: string }, value: string) =>
    createElement(TestContext.Provider, { value }, createElement(Child, elementProps));

  const { rerender } = await render(wrap(props, contextValue));
  return {
    get current() {
      return latest;
    },
    rerender: async (nextProps: { label: string }, nextContextValue: string) =>
      await rerender(wrap(nextProps, nextContextValue)),
  };
};

describe("useUnstableRenderReason", () => {
  it("classifies a hook with no attached ref as unknown", async () => {
    const { result } = await renderHook(() => useUnstableRenderReason());

    expect(result.current.reason).toBe("unknown");
  });

  it("classifies the mount render as mount", async () => {
    const child = await renderChild({ label: "a" });

    expect(child.current.reason).toBe("mount");
  });

  it("classifies a props-only change as props", async () => {
    const child = await renderChild({ label: "a" });
    expect(child.current.reason).toBe("mount");

    await child.rerender({ label: "b" });

    expect(child.current.reason).toBe("props");
  });

  it("classifies a local state change (same props) as state", async () => {
    const child = await renderChild({ label: "a" });
    expect(child.current.reason).toBe("mount");

    await act(() => {
      child.current.setCount(1);
    });

    expect(child.current.reason).toBe("state");
  });

  it("classifies a context value change (same props, no state change) as context", async () => {
    const child = await renderChildWithContext({ label: "a" }, "one");
    expect(child.current.reason).toBe("mount");

    await child.rerender({ label: "a" }, "two");

    expect(child.current.reason).toBe("context");
  });

  it("classifies a render with nothing locally observable changed as parent", async () => {
    const child = await renderChild({ label: "a" });
    expect(child.current.reason).toBe("mount");

    await child.rerender({ label: "a" });

    expect(child.current.reason).toBe("parent");
  });

  it("fails closed to unknown when reading the internal shape throws", async () => {
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

    const { rerender, result } = await renderHook(() => useUnstableRenderReason<HTMLDivElement>());
    result.current.ref.current = throwing;

    expect(async () => await rerender()).not.toThrow();
    expect(result.current.reason).toBe("unknown");
  });

  it("classifies as unknown for a DOM node react-dom never mounted", async () => {
    const { rerender, result } = await renderHook(() => useUnstableRenderReason<HTMLDivElement>());
    result.current.ref.current = document.createElement("div");

    await rerender();

    expect(result.current.reason).toBe("unknown");
  });

  it("classifies as props when the previous snapshot's props were null", async () => {
    const nullPropsFiber = {
      alternate: null,
      dependencies: null,
      memoizedProps: null,
      memoizedState: null,
      return: null,
      type: "div",
    };
    const somePropsFiber = {
      alternate: null,
      dependencies: null,
      memoizedProps: { x: 1 },
      memoizedState: null,
      return: null,
      type: "div",
    };
    const element = asTestDouble<Record<string, unknown>>(document.createElement("div"));

    const { rerender, result } = await renderHook(() => useUnstableRenderReason<HTMLDivElement>());

    element["__reactFiber$fake"] = nullPropsFiber;
    result.current.ref.current = asTestDouble<HTMLDivElement>(element);
    await rerender();
    expect(result.current.reason).toBe("mount");

    element["__reactFiber$fake"] = somePropsFiber;
    await rerender();
    expect(result.current.reason).toBe("props");
  });
});
