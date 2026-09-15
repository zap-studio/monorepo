import { afterEach, describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useBroadcastChannel } from "./use-broadcast-channel.ts";

const TEST_CHANNEL_NAME = "test-channel";

const OriginalBroadcastChannel = globalThis.BroadcastChannel;

afterEach(() => {
  globalThis.BroadcastChannel = OriginalBroadcastChannel;
});

describe("useBroadcastChannel", () => {
  it("reports supported: false and postMessage() no-ops when BroadcastChannel is unsupported", async () => {
    Reflect.deleteProperty(globalThis, "BroadcastChannel");

    const { result } = await renderHook(() => useBroadcastChannel<string>(TEST_CHANNEL_NAME));

    expect(result.current.supported).toBe(false);
    expect(() => {
      result.current.postMessage("anything");
    }).not.toThrow();
    expect(result.current.lastMessage).toBeUndefined();
  });

  it("reports supported: true and starts with no lastMessage", async () => {
    const { result } = await renderHook(() => useBroadcastChannel<string>(TEST_CHANNEL_NAME));

    expect(result.current.supported).toBe(true);
    expect(result.current.lastMessage).toBeUndefined();
  });

  it("receives a message posted from another channel instance with the same name", async () => {
    const sender = new BroadcastChannel(TEST_CHANNEL_NAME);
    const { result } = await renderHook(() => useBroadcastChannel<string>(TEST_CHANNEL_NAME));

    await act(() => {
      sender.postMessage("hello");
    });

    await vi.waitFor(() => expect(result.current.lastMessage).toBe("hello"));
    sender.close();
  });

  it("does not receive messages posted to a differently-named channel", async () => {
    const sender = new BroadcastChannel("other-channel");
    const { result } = await renderHook(() => useBroadcastChannel<string>(TEST_CHANNEL_NAME));

    await act(async () => {
      sender.postMessage("hello");
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.lastMessage).toBeUndefined();
    sender.close();
  });

  it("postMessage() sends to other instances on the same channel", async () => {
    const receiver = new BroadcastChannel(TEST_CHANNEL_NAME);
    const received = new Promise<string>((resolve) => {
      receiver.addEventListener("message", (event: MessageEvent<string>) => resolve(event.data), {
        once: true,
      });
    });
    const { result } = await renderHook(() => useBroadcastChannel<string>(TEST_CHANNEL_NAME));

    await act(() => {
      result.current.postMessage("from-hook");
    });

    await expect(received).resolves.toBe("from-hook");
    receiver.close();
  });

  it("re-opens the channel when name changes", async () => {
    const { rerender, result } = await renderHook(
      ({ name }: { name: string }) => useBroadcastChannel<string>(name),
      { initialProps: { name: "channel-a" } },
    );

    const senderA = new BroadcastChannel("channel-a");
    await act(() => {
      senderA.postMessage("a");
    });
    await vi.waitFor(() => expect(result.current.lastMessage).toBe("a"));
    senderA.close();

    await rerender({ name: "channel-b" });

    const senderA2 = new BroadcastChannel("channel-a");
    await act(async () => {
      senderA2.postMessage("still-a");
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(result.current.lastMessage).toBe("a");
    senderA2.close();

    const senderB = new BroadcastChannel("channel-b");
    await act(() => {
      senderB.postMessage("b");
    });
    await vi.waitFor(() => expect(result.current.lastMessage).toBe("b"));
    senderB.close();
  });

  it("closes the channel on unmount", async () => {
    const { result, unmount } = await renderHook(() =>
      useBroadcastChannel<string>(TEST_CHANNEL_NAME),
    );
    await unmount();

    const sender = new BroadcastChannel(TEST_CHANNEL_NAME);
    await act(async () => {
      sender.postMessage("after-unmount");
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.lastMessage).toBeUndefined();
    sender.close();
  });
});
