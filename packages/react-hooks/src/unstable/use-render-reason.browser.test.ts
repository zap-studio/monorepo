import { act, render, renderHook } from "@testing-library/react";
import { createContext, createElement, useContext, useState } from "react";
import { describe, expect, it } from "vitest";

import { useRenderReason, type RenderReason } from "./use-render-reason.ts";

const TestContext = createContext("default");

interface ChildHandle {
  reason: RenderReason;
  setCount: (value: number) => void;
}

/**
 * `useRenderReason` reads its ref one render behind (see its docs), so
 * `"mount"` is only observable on the render *after* the actual mount
 * commit. Renders once (the real mount), then "settles" with a same-props
 * re-render so the returned handle's `reason` is already `"mount"` —
 * from there, one more render is what each test asserts on.
 */
function renderChild(props: { label: string }) {
  let latest!: ChildHandle;
  function Child({ label }: { label: string }) {
    const { reason, ref } = useRenderReason<HTMLDivElement>();
    const [count, setCount] = useState(0);
    const contextValue = useContext(TestContext);
    latest = { reason, setCount };
    return createElement("div", { ref }, `${label}-${count}-${contextValue}`);
  }

  const { rerender } = render(createElement(Child, props));
  rerender(createElement(Child, props));
  return {
    get current() {
      return latest;
    },
    rerender: (nextProps: { label: string }) => rerender(createElement(Child, nextProps)),
  };
}

function renderChildWithContext(props: { label: string }, contextValue: string) {
  let latest!: ChildHandle;
  function Child({ label }: { label: string }) {
    const { reason, ref } = useRenderReason<HTMLDivElement>();
    const value = useContext(TestContext);
    latest = { reason, setCount: () => {} };
    return createElement("div", { ref }, `${label}-${value}`);
  }

  const wrap = (elementProps: { label: string }, value: string) =>
    createElement(TestContext.Provider, { value }, createElement(Child, elementProps));

  const { rerender } = render(wrap(props, contextValue));
  rerender(wrap(props, contextValue));
  return {
    get current() {
      return latest;
    },
    rerender: (nextProps: { label: string }, nextContextValue: string) =>
      rerender(wrap(nextProps, nextContextValue)),
  };
}

describe(useRenderReason, () => {
  it("classifies a hook with no attached ref as unknown", () => {
    const { result } = renderHook(() => useRenderReason());

    expect(result.current.reason).toBe("unknown");
  });

  it("classifies the first observable render as mount", () => {
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

    const { rerender, result } = renderHook(() => useRenderReason<HTMLDivElement>());
    result.current.ref.current = throwing;

    expect(() => rerender()).not.toThrow();
    expect(result.current.reason).toBe("unknown");
  });
});
