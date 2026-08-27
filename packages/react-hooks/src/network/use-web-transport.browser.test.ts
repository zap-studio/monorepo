import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useWebTransport } from "./use-web-transport.ts";

const TRANSPORT_URL = "https://example.com:4999/wt";
const NO_ROUTE_ERROR = "no route to host";
const STREAM_REFUSED_ERROR = "stream refused";

class MockWebTransport {
  static instances: MockWebTransport[] = [];

  closeCalled = false;
  closeInfo: WebTransportCloseInfo | undefined;
  closed: Promise<WebTransportCloseInfo>;
  datagrams: { readable: ReadableStream; writable: WritableStream };
  incomingController: ReadableStreamDefaultController | undefined;
  ready: Promise<void>;
  readonly url: string;
  writeShouldFail = false;
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

    this.datagrams = {
      readable: new ReadableStream({
        start: (controller) => {
          this.incomingController = controller;
        },
      }),
      writable: new WritableStream({
        write: (chunk) => {
          if (this.writeShouldFail) {
            throw new Error("datagram queue full");
          }
          this.writtenChunks.push(chunk);
        },
      }),
    };
  }

  close(closeInfo?: WebTransportCloseInfo) {
    this.closeCalled = true;
    this.closeInfo = closeInfo;
    this.resolveClosed(closeInfo ?? { closeCode: 0, reason: "" });
  }

  createBidirectionalStream = vi.fn((): Promise<WebTransportBidirectionalStream> =>
    Promise.resolve({} as WebTransportBidirectionalStream),
  );

  createUnidirectionalStream = vi.fn((): Promise<WritableStream> =>
    Promise.resolve(new WritableStream()),
  );

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

const installMockWebTransport = () => {
  MockWebTransport.instances = [];
  vi.stubGlobal("WebTransport", MockWebTransport);
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(useWebTransport, () => {
  it('starts as "connecting" and opens a transport for the given url', () => {
    installMockWebTransport();

    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));

    expect(result.current.status).toBe("connecting");
    expect(MockWebTransport.instances).toHaveLength(1);
    expect(MockWebTransport.instances[0]?.url).toBe(TRANSPORT_URL);
  });

  it('becomes "connected" once `ready` resolves', async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));

    await act(async () => {
      MockWebTransport.instances[0]?.open();
    });

    await waitFor(() => expect(result.current.status).toBe("connected"));
  });

  it('becomes "closed" with an error when `ready` rejects', async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));

    await act(async () => {
      MockWebTransport.instances[0]?.failReady(new Error(NO_ROUTE_ERROR));
    });

    await waitFor(() => expect(result.current.status).toBe("closed"));
    expect(result.current.error?.message).toBe(NO_ROUTE_ERROR);
  });

  it("wraps a non-Error rejection in an Error", async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));

    await act(async () => {
      MockWebTransport.instances[0]?.failReady(NO_ROUTE_ERROR);
    });

    await waitFor(() => expect(result.current.error?.message).toBe(NO_ROUTE_ERROR));
  });

  it('becomes "closed" once `closed` resolves', async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));

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
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];

    await act(async () => {
      transport?.incomingController?.enqueue(new Uint8Array([1, 2, 3]));
    });

    await waitFor(() => expect(result.current.lastDatagram).toEqual(new Uint8Array([1, 2, 3])));
  });

  it("sendDatagram() writes to the outgoing datagram stream", async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];

    await act(async () => {
      await expect(result.current.sendDatagram(new Uint8Array([9]))).resolves.toBe(true);
    });

    expect(transport?.writtenChunks).toEqual([new Uint8Array([9])]);
  });

  it("sendDatagram() sets error and resolves false when the write rejects", async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];
    if (transport) {
      transport.writeShouldFail = true;
    }

    await act(async () => {
      await expect(result.current.sendDatagram(new Uint8Array([9]))).resolves.toBe(false);
    });

    await waitFor(() => expect(result.current.error?.message).toBe("datagram queue full"));
  });

  it('becomes "closed" with an error when `closed` rejects', async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));

    await act(async () => {
      MockWebTransport.instances[0]?.failClosed(new Error("connection lost"));
    });

    await waitFor(() => expect(result.current.status).toBe("closed"));
    expect(result.current.error?.message).toBe("connection lost");
  });

  it("createBidirectionalStream() resolves the underlying stream", async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];

    let stream: WebTransportBidirectionalStream | undefined;
    await act(async () => {
      stream = await result.current.createBidirectionalStream();
    });

    expect(stream).toBeDefined();
    expect(transport?.createBidirectionalStream).toHaveBeenCalledTimes(1);
  });

  it("createBidirectionalStream() sets error and returns undefined when it rejects", async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];
    transport?.createBidirectionalStream.mockRejectedValueOnce(new Error(STREAM_REFUSED_ERROR));

    await act(async () => {
      await expect(result.current.createBidirectionalStream()).resolves.toBeUndefined();
    });

    await waitFor(() => expect(result.current.error?.message).toBe(STREAM_REFUSED_ERROR));
  });

  it("createUnidirectionalStream() resolves the underlying stream", async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];

    let stream: WritableStream | undefined;
    await act(async () => {
      stream = await result.current.createUnidirectionalStream();
    });

    expect(stream).toBeInstanceOf(WritableStream);
    expect(transport?.createUnidirectionalStream).toHaveBeenCalledTimes(1);
  });

  it("createUnidirectionalStream() sets error and returns undefined when it rejects", async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];
    transport?.createUnidirectionalStream.mockRejectedValueOnce(new Error(STREAM_REFUSED_ERROR));

    await act(async () => {
      await expect(result.current.createUnidirectionalStream()).resolves.toBeUndefined();
    });

    await waitFor(() => expect(result.current.error?.message).toBe(STREAM_REFUSED_ERROR));
  });

  it("close() closes the underlying transport", async () => {
    installMockWebTransport();
    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));

    await act(async () => {
      result.current.close({ closeCode: 1, reason: "done" });
    });

    expect(MockWebTransport.instances[0]?.closeCalled).toBe(true);
    expect(MockWebTransport.instances[0]?.closeInfo).toEqual({ closeCode: 1, reason: "done" });
  });

  it("closes the transport on unmount", () => {
    installMockWebTransport();
    const { unmount } = renderHook(() => useWebTransport(TRANSPORT_URL));

    unmount();

    expect(MockWebTransport.instances[0]?.closeCalled).toBe(true);
  });

  it("ignores a stale `ready` resolution once cancelled by unmount", async () => {
    installMockWebTransport();
    const { unmount } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];

    // `open()` schedules the `ready`-continuation as a microtask; `unmount()` aborts
    // synchronously before that microtask runs, so the continuation's status update is skipped.
    transport?.open();
    unmount();
    await act(async () => {});
  });

  it("ignores a stale `ready` rejection once cancelled by unmount", async () => {
    installMockWebTransport();
    const { unmount } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];

    transport?.failReady(new Error("too late"));
    unmount();
    await act(async () => {});
  });

  it("ignores a stale `closed` resolution once cancelled by unmount", async () => {
    installMockWebTransport();
    const { unmount } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];

    transport?.close();
    unmount();
    await act(async () => {});
  });

  it("ignores a stale `closed` rejection once cancelled by unmount", async () => {
    installMockWebTransport();
    const { unmount } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];

    transport?.failClosed(new Error("too late"));
    unmount();
    await act(async () => {});
  });

  it("ignores a stale datagram once cancelled by unmount", async () => {
    installMockWebTransport();
    const { result, unmount } = renderHook(() => useWebTransport(TRANSPORT_URL));
    const transport = MockWebTransport.instances[0];

    transport?.incomingController?.enqueue(new Uint8Array([1]));
    unmount();
    await act(async () => {});

    expect(result.current.lastDatagram).toBeUndefined();
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

    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));

    expect(result.current.supported).toBe(false);
    expect(result.current.status).toBe("closed");
  });

  it("resolves false/undefined from the imperative methods when unsupported", async () => {
    vi.stubGlobal("WebTransport", undefined);

    const { result } = renderHook(() => useWebTransport(TRANSPORT_URL));

    await expect(result.current.sendDatagram(new Uint8Array([1]))).resolves.toBe(false);
    await expect(result.current.createBidirectionalStream()).resolves.toBeUndefined();
    await expect(result.current.createUnidirectionalStream()).resolves.toBeUndefined();
  });
});
