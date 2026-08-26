import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useWebTransport } from "./use-web-transport.ts";

class MockWebTransport {
  static instances: MockWebTransport[] = [];

  closeCalled = false;
  closeInfo: WebTransportCloseInfo | undefined;
  closed: Promise<WebTransportCloseInfo>;
  datagrams: { readable: ReadableStream; writable: WritableStream };
  incomingController: ReadableStreamDefaultController | undefined;
  ready: Promise<void>;
  readonly url: string;
  writtenChunks: unknown[] = [];

  private rejectClosed!: (error: unknown) => void;
  private rejectReady!: (error: unknown) => void;
  private resolveClosed!: (info: WebTransportCloseInfo) => void;
  private resolveReady!: () => void;

  constructor(url: string) {
    this.url = url;
    MockWebTransport.instances.push(this);

    this.ready = new Promise((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    this.closed = new Promise((resolve, reject) => {
      this.resolveClosed = resolve;
      this.rejectClosed = reject;
    });

    const self = this;
    this.datagrams = {
      readable: new ReadableStream({
        start(controller) {
          self.incomingController = controller;
        },
      }),
      writable: new WritableStream({
        write(chunk) {
          self.writtenChunks.push(chunk);
        },
      }),
    };
  }

  close(closeInfo?: WebTransportCloseInfo) {
    this.closeCalled = true;
    this.closeInfo = closeInfo;
    this.resolveClosed(closeInfo ?? { closeCode: 0, reason: "" });
  }

  createBidirectionalStream(): Promise<WebTransportBidirectionalStream> {
    return Promise.resolve({} as WebTransportBidirectionalStream);
  }

  createUnidirectionalStream(): Promise<WritableStream> {
    return Promise.resolve(new WritableStream());
  }

  failReady(error: unknown) {
    this.rejectReady(error);
  }

  failClosed(error: unknown) {
    this.rejectClosed(error);
  }

  open() {
    this.resolveReady();
  }
}

function installMockWebTransport() {
  MockWebTransport.instances = [];
  vi.stubGlobal("WebTransport", MockWebTransport);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(useWebTransport, () => {
  it('starts as "connecting" and opens a transport for the given url', () => {
    installMockWebTransport();

    const { result } = renderHook(() => useWebTransport("https://example.com:4999/wt"));

    expect(result.current.status).toBe("connecting");
    expect(MockWebTransport.instances).toHaveLength(1);
    expect(MockWebTransport.instances[0]?.url).toBe("https://example.com:4999/wt");
  });

  it('becomes "connected" once `ready` resolves', async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport("https://example.com:4999/wt"));

    await act(async () => {
      MockWebTransport.instances[0]?.open();
    });

    await waitFor(() => expect(result.current.status).toBe("connected"));
  });

  it('becomes "closed" with an error when `ready` rejects', async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport("https://example.com:4999/wt"));

    await act(async () => {
      MockWebTransport.instances[0]?.failReady(new Error("no route to host"));
    });

    await waitFor(() => expect(result.current.status).toBe("closed"));
    expect(result.current.error?.message).toBe("no route to host");
  });

  it('becomes "closed" once `closed` resolves', async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport("https://example.com:4999/wt"));

    await act(async () => {
      MockWebTransport.instances[0]?.open();
    });
    await waitFor(() => expect(result.current.status).toBe("connected"));

    await act(async () => {
      MockWebTransport.instances[0]?.close();
    });

    await waitFor(() => expect(result.current.status).toBe("closed"));
  });

  it("captures the last datagram received", async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport("https://example.com:4999/wt"));
    const transport = MockWebTransport.instances[0];

    await act(async () => {
      transport?.incomingController?.enqueue(new Uint8Array([1, 2, 3]));
    });

    await waitFor(() => expect(result.current.lastDatagram).toEqual(new Uint8Array([1, 2, 3])));
  });

  it("sendDatagram() writes to the outgoing datagram stream", async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport("https://example.com:4999/wt"));
    const transport = MockWebTransport.instances[0];

    await act(async () => {
      await expect(result.current.sendDatagram(new Uint8Array([9]))).resolves.toBe(true);
    });

    expect(transport?.writtenChunks).toEqual([new Uint8Array([9])]);
  });

  it("close() closes the underlying transport", async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport("https://example.com:4999/wt"));

    await act(async () => {
      result.current.close({ closeCode: 1, reason: "done" });
    });

    expect(MockWebTransport.instances[0]?.closeCalled).toBe(true);
    expect(MockWebTransport.instances[0]?.closeInfo).toEqual({ closeCode: 1, reason: "done" });
  });

  it("closes the transport on unmount", () => {
    installMockWebTransport();
    const { unmount } = renderHook(() => useWebTransport("https://example.com:4999/wt"));

    unmount();

    expect(MockWebTransport.instances[0]?.closeCalled).toBe(true);
  });

  it('stays "closed" and opens no transport when url is undefined', () => {
    installMockWebTransport();

    const { result } = renderHook(() => useWebTransport(undefined));

    expect(result.current.status).toBe("closed");
    expect(MockWebTransport.instances).toHaveLength(0);
  });

  it("opens a new transport when the url changes", () => {
    installMockWebTransport();
    const { rerender } = renderHook(({ url }) => useWebTransport(url), {
      initialProps: { url: "https://a.example.com:4999/wt" },
    });

    rerender({ url: "https://b.example.com:4999/wt" });

    expect(MockWebTransport.instances).toHaveLength(2);
    expect(MockWebTransport.instances[1]?.url).toBe("https://b.example.com:4999/wt");
  });

  it("reports supported: false when the WebTransport API is unavailable", () => {
    vi.stubGlobal("WebTransport", undefined);

    const { result } = renderHook(() => useWebTransport("https://example.com:4999/wt"));

    expect(result.current.supported).toBe(false);
    expect(result.current.status).toBe("closed");
  });

  it("resolves false/undefined from the imperative methods when unsupported", async () => {
    vi.stubGlobal("WebTransport", undefined);

    const { result } = renderHook(() => useWebTransport("https://example.com:4999/wt"));

    await expect(result.current.sendDatagram(new Uint8Array([1]))).resolves.toBe(false);
    await expect(result.current.createBidirectionalStream()).resolves.toBeUndefined();
    await expect(result.current.createUnidirectionalStream()).resolves.toBeUndefined();
  });
});
