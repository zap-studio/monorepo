import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useClickOutside } from "./use-click-outside.ts";

describe("useClickOutside", () => {
  it("calls onOutside when a mousedown lands outside the ref'd element", () => {
    const onOutside = vi.fn();
    const inside = document.createElement("div");
    const outside = document.createElement("span");
    document.body.append(inside, outside);

    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(onOutside));
    result.current.current = inside;

    outside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onOutside).toHaveBeenCalledTimes(1);
    inside.remove();
    outside.remove();
  });

  it("does not call onOutside when the mousedown lands inside the ref'd element", () => {
    const onOutside = vi.fn();
    const inside = document.createElement("div");
    const child = document.createElement("span");
    inside.append(child);
    document.body.append(inside);

    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(onOutside));
    result.current.current = inside;

    child.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onOutside).not.toHaveBeenCalled();
    inside.remove();
  });

  it("reacts to touchstart the same way", () => {
    const onOutside = vi.fn();
    const inside = document.createElement("div");
    const outside = document.createElement("span");
    document.body.append(inside, outside);

    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(onOutside));
    result.current.current = inside;

    outside.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));

    expect(onOutside).toHaveBeenCalledTimes(1);
    inside.remove();
    outside.remove();
  });

  it("ignores events when the ref is not attached to any element", () => {
    const onOutside = vi.fn();
    renderHook(() => useClickOutside<HTMLDivElement>(onOutside));

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onOutside).not.toHaveBeenCalled();
  });

  it("ignores events whose target is not a Node", () => {
    const onOutside = vi.fn();
    const inside = document.createElement("div");
    document.body.append(inside);

    const { result } = renderHook(() => useClickOutside<HTMLDivElement>(onOutside));
    result.current.current = inside;

    const event = new MouseEvent("mousedown", { bubbles: true });
    Object.defineProperty(event, "target", { value: {} });
    document.body.dispatchEvent(event);

    expect(onOutside).not.toHaveBeenCalled();
    inside.remove();
  });

  it("calls the latest onOutside without re-subscribing", () => {
    const first = vi.fn();
    const second = vi.fn();
    const outside = document.createElement("span");
    document.body.append(outside);

    const { rerender, result } = renderHook(
      ({ onOutside }: { onOutside: (event: MouseEvent | TouchEvent) => void }) =>
        useClickOutside<HTMLDivElement>(onOutside),
      { initialProps: { onOutside: first } },
    );
    result.current.current = document.createElement("div");

    rerender({ onOutside: second });
    outside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    outside.remove();
  });

  it("removes the listeners on unmount", () => {
    const onOutside = vi.fn();
    const outside = document.createElement("span");
    document.body.append(outside);

    const { result, unmount } = renderHook(() => useClickOutside<HTMLDivElement>(onOutside));
    result.current.current = document.createElement("div");
    unmount();

    outside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onOutside).not.toHaveBeenCalled();
    outside.remove();
  });
});
