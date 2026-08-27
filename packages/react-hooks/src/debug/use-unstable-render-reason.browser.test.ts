import { act, render, renderHook } from "@testing-library/react";
import { createContext, createElement, useContext, useRef, useState } from "react";
import { describe, expect, it } from "vitest";

import { useUnstableRenderReason, type RenderReason } from "./use-unstable-render-reason.ts";

const TestContext = createContext("default");

interface ChildHandle {
  reason: RenderReason;
  setCount: (value: number) => void;
}

const renderChild = (props: { label: string }) => {
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

  const { rerender } = render(createElement(Child, props));
  return {
    get current() {
      return latest;
    },
    rerender: (nextProps: { label: string }) => rerender(createElement(Child, nextProps)),
  };
};

const renderChildWithContext = (props: { label: string }, contextValue: string) => {
  let latest!: ChildHandle;
  const Child = ({ label }: { label: string }) => {
    const { reason, ref } = useUnstableRenderReason<HTMLDivElement>();
    const value = useContext(TestContext);
    latest = { reason, setCount: () => {} };
    return createElement("div", { ref }, `${label}-${value}`);
  };

  const wrap = (elementProps: { label: string }, value: string) =>
    createElement(TestContext.Provider, { value }, createElement(Child, elementProps));

  const { rerender } = render(wrap(props, contextValue));
  return {
    get current() {
      return latest;
    },
    rerender: (nextProps: { label: string }, nextContextValue: string) =>
      rerender(wrap(nextProps, nextContextValue)),
  };
};

describe(useUnstableRenderReason, () => {
  it("classifies a hook with no attached ref as unknown", () => {
    const { result } = renderHook(() => useUnstableRenderReason());

    expect(result.current.reason).toBe("unknown");
  });

  it("classifies the mount render as mount", () => {
    const child = renderChild({ label: "a" });

    expect(child.current.reason).toBe("mount");
  });

  it("classifies a props-only change as props", () => {
    const child = renderChild({ label: "a" });
    expect(child.current.reason).toBe("mount");

    child.rerender({ label: "b" });

    expect(child.current.reason).toBe("props");
  });

  it("classifies a local state change (same props) as state", () => {
    const child = renderChild({ label: "a" });
    expect(child.current.reason).toBe("mount");

    act(() => {
      child.current.setCount(1);
    });

    expect(child.current.reason).toBe("state");
  });

  it("classifies a context value change (same props, no state change) as context", () => {
    const child = renderChildWithContext({ label: "a" }, "one");
    expect(child.current.reason).toBe("mount");

    child.rerender({ label: "a" }, "two");

    expect(child.current.reason).toBe("context");
  });

  it("classifies a render with nothing locally observable changed as parent", () => {
    const child = renderChild({ label: "a" });
    expect(child.current.reason).toBe("mount");

    child.rerender({ label: "a" });

    expect(child.current.reason).toBe("parent");
  });

  it("fails closed to unknown when reading the internal shape throws", () => {
    const throwing = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("boom");
        },
      },
    ) as unknown as HTMLDivElement;

    const { rerender, result } = renderHook(() => useUnstableRenderReason<HTMLDivElement>());
    result.current.ref.current = throwing;

    expect(() => rerender()).not.toThrow();
    expect(result.current.reason).toBe("unknown");
  });

  it("classifies as unknown for a DOM node react-dom never mounted", () => {
    const { rerender, result } = renderHook(() => useUnstableRenderReason<HTMLDivElement>());
    result.current.ref.current = document.createElement("div");

    rerender();

    expect(result.current.reason).toBe("unknown");
  });

  it("classifies as props when the previous snapshot's props were null", () => {
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
    const element = document.createElement("div") as unknown as Record<string, unknown>;

    const { rerender, result } = renderHook(() => useUnstableRenderReason<HTMLDivElement>());

    element["__reactFiber$fake"] = nullPropsFiber;
    result.current.ref.current = element as unknown as HTMLDivElement;
    rerender();
    expect(result.current.reason).toBe("mount");

    element["__reactFiber$fake"] = somePropsFiber;
    rerender();
    expect(result.current.reason).toBe("props");
  });
});
