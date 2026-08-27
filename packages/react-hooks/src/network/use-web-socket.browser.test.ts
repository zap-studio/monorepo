import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useWebSocket } from "./use-web-socket.ts";

const SOCKET_URL = "wss://example.com";

class MockWebSocket extends EventTarget {
  static instances: MockWebSocket[] = [];
  closed = false;
  sent: unknown[] = [];
  readonly url: string;

  constructor(url: string) {
    super();
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close() {
    this.closed = true;
    this.dispatchEvent(new Event("close"));
  }

  send(data: unknown) {
    this.sent.push(data);
  }
}

const installMockWebSocket = () => {
  MockWebSocket.instances = [];
  Object.defineProperty(window, "WebSocket", { configurable: true, value: MockWebSocket });
};

afterEach(() => {
  Object.defineProperty(window, "WebSocket", { configurable: true, value: undefined });
});

describe("useWebSocket", () => {
  it('starts as "connecting" and opens a socket for the given url', () => {
    installMockWebSocket();

    const { result } = renderHook(() => useWebSocket(SOCKET_URL));

    expect(result.current.status).toBe("connecting");
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0]?.url).toBe(SOCKET_URL);
  });

  it('becomes "open" when the socket opens', async () => {
    installMockWebSocket();
    const { result } = renderHook(() => useWebSocket(SOCKET_URL));

    await act(async () => {
      MockWebSocket.instances[0]?.dispatchEvent(new Event("open"));
    });

    expect(result.current.status).toBe("open");
  });

  it("captures the last message received", async () => {
    installMockWebSocket();
    const { result } = renderHook(() => useWebSocket(SOCKET_URL));

    await act(async () => {
      MockWebSocket.instances[0]?.dispatchEvent(new MessageEvent("message", { data: "hello" }));
    });

    expect(result.current.lastMessage?.data).toBe("hello");
  });

  it("send() forwards to the underlying socket", async () => {
    installMockWebSocket();
    const { result } = renderHook(() => useWebSocket(SOCKET_URL));

    await act(async () => {
      result.current.send("ping");
    });

    expect(MockWebSocket.instances[0]?.sent).toEqual(["ping"]);
  });

  it('becomes "closed" when the socket closes', async () => {
    installMockWebSocket();
    const { result } = renderHook(() => useWebSocket(SOCKET_URL));

    await act(async () => {
      MockWebSocket.instances[0]?.dispatchEvent(new Event("close"));
    });

    expect(result.current.status).toBe("closed");
  });

  it('becomes "closed" on a socket error', async () => {
    installMockWebSocket();
    const { result } = renderHook(() => useWebSocket(SOCKET_URL));

    await act(async () => {
      MockWebSocket.instances[0]?.dispatchEvent(new Event("error"));
    });

    expect(result.current.status).toBe("closed");
  });

  it("close() closes the underlying socket", async () => {
    installMockWebSocket();
    const { result } = renderHook(() => useWebSocket(SOCKET_URL));

    await act(async () => {
      result.current.close();
    });

    expect(MockWebSocket.instances[0]?.closed).toBe(true);
  });

  it('stays "closed" and opens no socket when url is undefined', () => {
    installMockWebSocket();

    const { result } = renderHook(() => useWebSocket(undefined));

    expect(result.current.status).toBe("closed");
    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("opens a new socket when the url changes", () => {
    installMockWebSocket();
    const { rerender } = renderHook(({ url }) => useWebSocket(url), {
      initialProps: { url: "wss://a.example.com" },
    });

    rerender({ url: "wss://b.example.com" });

    expect(MockWebSocket.instances).toHaveLength(2);
    expect(MockWebSocket.instances[1]?.url).toBe("wss://b.example.com");
  });

  it("closes the socket and removes listeners on unmount", () => {
    installMockWebSocket();
    const { unmount } = renderHook(() => useWebSocket(SOCKET_URL));

    unmount();

    expect(MockWebSocket.instances[0]?.closed).toBe(true);
  });
});
