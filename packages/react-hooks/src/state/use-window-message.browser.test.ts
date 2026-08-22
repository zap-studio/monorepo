import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useWindowMessage } from "./use-window-message.ts";

describe(useWindowMessage, () => {
  it("starts with no lastMessage/lastError", () => {
    const { result } = renderHook(() => useWindowMessage<string>());

    expect(result.current.lastMessage).toBeUndefined();
    expect(result.current.lastError).toBeUndefined();
  });

  it("records a message event", async () => {
    const { result } = renderHook(() => useWindowMessage<string>());

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", { data: "hello", origin: "https://example.com" }),
      );
    });

    expect(result.current.lastMessage).toEqual({
      data: "hello",
      origin: "https://example.com",
      source: null,
    });
  });

  it("filters out messages from other origins when originFilter is set", async () => {
    const { result } = renderHook(() => useWindowMessage<string>("https://trusted.example"));

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", { data: "untrusted", origin: "https://evil.example" }),
      );
    });
    expect(result.current.lastMessage).toBeUndefined();

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", { data: "trusted", origin: "https://trusted.example" }),
      );
    });
    expect(result.current.lastMessage?.data).toBe("trusted");
  });

  it("uses the latest originFilter without re-subscribing", async () => {
    const { rerender, result } = renderHook(
      ({ originFilter }: { originFilter: string | undefined }) =>
        useWindowMessage<string>(originFilter),
      { initialProps: { originFilter: undefined as string | undefined } },
    );

    rerender({ originFilter: "https://trusted.example" });

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", { data: "untrusted", origin: "https://evil.example" }),
      );
    });

    expect(result.current.lastMessage).toBeUndefined();
  });

  it("records a messageerror event", async () => {
    const { result } = renderHook(() => useWindowMessage<string>());
    const errorEvent = new MessageEvent("messageerror", { origin: "https://example.com" });

    await act(async () => {
      window.dispatchEvent(errorEvent);
    });

    expect(result.current.lastError).toBe(errorEvent);
  });

  it("postMessage() forwards to the target window", () => {
    const { result } = renderHook(() => useWindowMessage<string>());
    const target = {
      postMessage: (message: unknown, targetOrigin: string) => calls.push([message, targetOrigin]),
    };
    const calls: [unknown, string][] = [];

    act(() => {
      result.current.postMessage(target as unknown as Window, "hi", "https://example.com");
    });

    expect(calls).toEqual([["hi", "https://example.com"]]);
  });

  it("removes the message/messageerror listeners on unmount", async () => {
    const { result, unmount } = renderHook(() => useWindowMessage<string>());
    unmount();

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent("message", { data: "after-unmount", origin: "https://example.com" }),
      );
    });

    expect(result.current.lastMessage).toBeUndefined();
  });
});
