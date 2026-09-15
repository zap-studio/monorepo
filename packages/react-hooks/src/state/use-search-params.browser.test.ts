import { afterEach, describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useSearchParams } from "./use-search-params.ts";

afterEach(() => {
  history.replaceState(null, "", "/");
});

describe("useSearchParams", () => {
  it("reads the current location.search", async () => {
    history.pushState(null, "", "/path?a=1&b=2");

    const { result } = await renderHook(() => useSearchParams());

    expect(result.current[0].get("a")).toBe("1");
    expect(result.current[0].get("b")).toBe("2");
  });

  it("updates on popstate", async () => {
    const { result } = await renderHook(() => useSearchParams());

    await act(async () => {
      history.pushState(null, "", "/path?page=2");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current[0].get("page")).toBe("2");
  });

  it("setSearchParams() pushes a new history entry and updates state", async () => {
    history.pushState(null, "", "/path");
    const { result } = await renderHook(() => useSearchParams());

    await act(() => {
      result.current[1]({ page: "3" });
    });

    expect(result.current[0].get("page")).toBe("3");
    expect(location.search).toBe("?page=3");
    expect(location.pathname).toBe("/path");
  });

  it("setSearchParams() accepts an updater function reading the latest params", async () => {
    history.pushState(null, "", "/path?a=1");
    const { result } = await renderHook(() => useSearchParams());

    await act(() => {
      result.current[1]((prev) => {
        const next = new URLSearchParams(prev);
        next.set("b", "2");
        return next;
      });
    });

    expect(result.current[0].get("a")).toBe("1");
    expect(result.current[0].get("b")).toBe("2");
  });

  it("setSearchParams({ replace: true }) replaces instead of pushing", async () => {
    history.pushState(null, "", "/path?a=1");
    const lengthBefore = history.length;
    const { result } = await renderHook(() => useSearchParams());

    await act(() => {
      result.current[1]({ a: "2" }, { replace: true });
    });

    expect(result.current[0].get("a")).toBe("2");
    expect(history).toHaveLength(lengthBefore);
  });

  it("omits the query string entirely when params are empty", async () => {
    history.pushState(null, "", "/path?a=1");
    const { result } = await renderHook(() => useSearchParams());

    await act(() => {
      result.current[1]({});
    });

    expect(location.search).toBe("");
  });

  it("removes the popstate listener on unmount", async () => {
    const { result, unmount } = await renderHook(() => useSearchParams());
    const before = result.current[0].toString();
    await unmount();

    await act(async () => {
      history.pushState(null, "", "/path?after=unmount");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current[0].toString()).toBe(before);
  });
});
