import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useEventSource } from "./use-event-source.ts";

const STREAM_URL = "https://example.com/stream";

class MockEventSource extends EventTarget {
  static instances: MockEventSource[] = [];
  closed = false;
  readonly url: string;

  constructor(url: string) {
    super();
    this.url = url;
    MockEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }
}

const installMockEventSource = () => {
  MockEventSource.instances = [];
  Object.defineProperty(window, "EventSource", { configurable: true, value: MockEventSource });
};

afterEach(() => {
  Object.defineProperty(window, "EventSource", { configurable: true, value: undefined });
});

describe("useEventSource", () => {
  it('starts as "connecting" and opens a source for the given url', () => {
    installMockEventSource();

    const { result } = renderHook(() => useEventSource(STREAM_URL));

    expect(result.current.status).toBe("connecting");
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0]?.url).toBe(STREAM_URL);
  });

  it('becomes "open" when the source opens', async () => {
    installMockEventSource();
    const { result } = renderHook(() => useEventSource(STREAM_URL));

    await act(async () => {
      MockEventSource.instances[0]?.dispatchEvent(new Event("open"));
    });

    expect(result.current.status).toBe("open");
  });

  it("captures each message's data", async () => {
    installMockEventSource();
    const { result } = renderHook(() => useEventSource(STREAM_URL));

    await act(async () => {
      MockEventSource.instances[0]?.dispatchEvent(new MessageEvent("message", { data: "hello" }));
    });

    expect(result.current.data).toBe("hello");
  });

  it('becomes "closed" on a source error', async () => {
    installMockEventSource();
    const { result } = renderHook(() => useEventSource(STREAM_URL));

    await act(async () => {
      MockEventSource.instances[0]?.dispatchEvent(new Event("error"));
    });

    expect(result.current.status).toBe("closed");
  });

  it("close() closes the underlying source", async () => {
    installMockEventSource();
    const { result } = renderHook(() => useEventSource(STREAM_URL));

    await act(async () => {
      result.current.close();
    });

    expect(MockEventSource.instances[0]?.closed).toBe(true);
    expect(result.current.status).toBe("closed");
  });

  it('stays "closed" and opens no source when url is undefined', () => {
    installMockEventSource();

    const { result } = renderHook(() => useEventSource(undefined));

    expect(result.current.status).toBe("closed");
    expect(MockEventSource.instances).toHaveLength(0);
  });

  it("opens a new source when the url changes", () => {
    installMockEventSource();
    const { rerender } = renderHook(({ url }) => useEventSource(url), {
      initialProps: { url: "https://a.example.com/stream" },
    });

    rerender({ url: "https://b.example.com/stream" });

    expect(MockEventSource.instances).toHaveLength(2);
    expect(MockEventSource.instances[1]?.url).toBe("https://b.example.com/stream");
  });

  it("closes the source and removes listeners on unmount", () => {
    installMockEventSource();
    const { unmount } = renderHook(() => useEventSource(STREAM_URL));

    unmount();

    expect(MockEventSource.instances[0]?.closed).toBe(true);
  });
});
