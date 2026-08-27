import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useScript } from "./use-script.ts";

let counter = 0;
const uniqueSrc = (): string => {
  counter += 1;
  return `https://example.com/script-${counter}.js`;
};

const scriptFor = (src: string): HTMLScriptElement | null => {
  return document.querySelector(`script[src="${src}"]`);
};

describe(useScript, () => {
  it("starts with status: loading and appends a <script> tag", () => {
    const src = uniqueSrc();
    const { result } = renderHook(() => useScript(src));

    expect(result.current.status).toBe("loading");
    expect(scriptFor(src)).not.toBeNull();
  });

  it("becomes ready when the script fires load", () => {
    const src = uniqueSrc();
    const { result } = renderHook(() => useScript(src));

    act(() => {
      scriptFor(src)?.dispatchEvent(new Event("load"));
    });

    expect(result.current.status).toBe("ready");
  });

  it("becomes error when the script fires error", () => {
    const src = uniqueSrc();
    const { result } = renderHook(() => useScript(src));

    act(() => {
      scriptFor(src)?.dispatchEvent(new Event("error"));
    });

    expect(result.current.status).toBe("error");
  });

  it("dedupes concurrent requests for the same src into a single tag", () => {
    const src = uniqueSrc();
    renderHook(() => useScript(src));
    renderHook(() => useScript(src));

    expect(document.querySelectorAll(`script[src="${src}"]`)).toHaveLength(1);
  });

  it("a later consumer immediately reflects an already-settled script", () => {
    const src = uniqueSrc();
    const first = renderHook(() => useScript(src));
    act(() => {
      scriptFor(src)?.dispatchEvent(new Event("load"));
    });
    expect(first.result.current.status).toBe("ready");

    const second = renderHook(() => useScript(src));

    expect(second.result.current.status).toBe("ready");
  });

  it("keeps the tag when one of several consumers unmounts", () => {
    const src = uniqueSrc();
    const first = renderHook(() => useScript(src, { removeOnUnmount: true }));
    renderHook(() => useScript(src, { removeOnUnmount: true }));

    first.unmount();

    expect(scriptFor(src)).not.toBeNull();
  });

  it("removes the tag when the last consumer unmounts with removeOnUnmount: true", () => {
    const src = uniqueSrc();
    const { unmount } = renderHook(() => useScript(src, { removeOnUnmount: true }));

    unmount();

    expect(scriptFor(src)).toBeNull();
  });

  it("leaves the tag in place on unmount by default", () => {
    const src = uniqueSrc();
    const { unmount } = renderHook(() => useScript(src));

    unmount();

    expect(scriptFor(src)).not.toBeNull();
  });

  it("stops updating status after unmount", () => {
    const src = uniqueSrc();
    const { result, unmount } = renderHook(() => useScript(src));
    unmount();

    act(() => {
      scriptFor(src)?.dispatchEvent(new Event("load"));
    });

    expect(result.current.status).toBe("loading");
  });
});
