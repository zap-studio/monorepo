import { describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useScript } from "./use-script.ts";

let counter = 0;
const uniqueSrc = (): string => {
  counter += 1;
  return `https://example.com/script-${counter}.js`;
};

const scriptFor = (src: string): HTMLScriptElement | null => {
  // oxlint-disable-next-line testing-library/no-node-access -- a <script> tag has no ARIA role and never renders visible content, so no Testing Library query can reach it. Direct DOM access is the only way to assert it exists.
  return document.querySelector(`script[src="${src}"]`);
};

describe("useScript", () => {
  it("starts with status: loading and appends a <script> tag", async () => {
    const src = uniqueSrc();
    const { result } = await renderHook(() => useScript(src));

    expect(result.current.status).toBe("loading");
    expect(scriptFor(src)).not.toBeNull();
  });

  it("becomes ready when the script fires load", async () => {
    const src = uniqueSrc();
    const { result } = await renderHook(() => useScript(src));

    await act(() => {
      scriptFor(src)?.dispatchEvent(new Event("load"));
    });

    expect(result.current.status).toBe("ready");
  });

  it("becomes error when the script fires error", async () => {
    const src = uniqueSrc();
    const { result } = await renderHook(() => useScript(src));

    await act(() => {
      scriptFor(src)?.dispatchEvent(new Event("error"));
    });

    expect(result.current.status).toBe("error");
  });

  it("dedupes concurrent requests for the same src into a single tag", async () => {
    const src = uniqueSrc();
    await renderHook(() => useScript(src));
    await renderHook(() => useScript(src));

    // oxlint-disable-next-line testing-library/no-node-access -- same reason as scriptFor above: a <script> tag has no ARIA role, so there is no query for it.
    expect(document.querySelectorAll(`script[src="${src}"]`)).toHaveLength(1);
  });

  it("a later consumer immediately reflects an already-settled script", async () => {
    const src = uniqueSrc();
    const first = await renderHook(() => useScript(src));
    await act(() => {
      scriptFor(src)?.dispatchEvent(new Event("load"));
    });
    expect(first.result.current.status).toBe("ready");

    const second = await renderHook(() => useScript(src));

    expect(second.result.current.status).toBe("ready");
  });

  it("keeps the tag when one of several consumers unmounts", async () => {
    const src = uniqueSrc();
    const first = await renderHook(() => useScript(src, { removeOnUnmount: true }));
    await renderHook(() => useScript(src, { removeOnUnmount: true }));

    await first.unmount();

    expect(scriptFor(src)).not.toBeNull();
  });

  it("removes the tag when the last consumer unmounts with removeOnUnmount: true", async () => {
    const src = uniqueSrc();
    const { unmount } = await renderHook(() => useScript(src, { removeOnUnmount: true }));

    await unmount();

    expect(scriptFor(src)).toBeNull();
  });

  it("leaves the tag in place on unmount by default", async () => {
    const src = uniqueSrc();
    const { unmount } = await renderHook(() => useScript(src));

    await unmount();

    expect(scriptFor(src)).not.toBeNull();
  });

  it("stops updating status after unmount", async () => {
    const src = uniqueSrc();
    const { result, unmount } = await renderHook(() => useScript(src));
    await unmount();

    await act(() => {
      scriptFor(src)?.dispatchEvent(new Event("load"));
    });

    expect(result.current.status).toBe("loading");
  });
});
