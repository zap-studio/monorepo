import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useExperimentalNfc } from "./use-experimental-nfc.ts";

type ReaderMock = EventTarget & {
  makeReadOnly: (options?: { signal?: AbortSignal }) => Promise<void>;
  scan: (options?: { signal?: AbortSignal }) => Promise<void>;
  write: (message: unknown, options?: { overwrite?: boolean }) => Promise<void>;
};

const createReaderMock = (
  overrides: {
    makeReadOnly?: () => Promise<void>;
    scan?: (options?: { signal?: AbortSignal }) => Promise<void>;
    write?: (message: unknown, options?: { overwrite?: boolean }) => Promise<void>;
  } = {},
) => {
  // SAFETY: scan/write/makeReadOnly are assigned on `reader` immediately below, and
  // EventTarget already supplies addEventListener/removeEventListener/dispatchEvent,
  // which is everything the hook calls on the NDEFReader instance.
  const reader = new EventTarget() as ReaderMock;
  reader.scan = vi.fn<(options?: { signal?: AbortSignal }) => Promise<void>>(
    overrides.scan ?? (() => Promise.resolve()),
  );
  reader.write = vi.fn<(message: unknown, options?: { overwrite?: boolean }) => Promise<void>>(
    overrides.write ?? (() => Promise.resolve()),
  );
  reader.makeReadOnly = vi.fn<() => Promise<void>>(
    overrides.makeReadOnly ?? (() => Promise.resolve()),
  );
  return reader;
};

const stubNdefReader = (reader: ReaderMock) => {
  const NDEFReaderCtor = vi.fn<() => ReaderMock>().mockImplementation(function NDEFReader() {
    return reader;
  });
  vi.stubGlobal("NDEFReader", NDEFReaderCtor);
  return NDEFReaderCtor;
};

const fireReading = (
  reader: ReaderMock,
  serialNumber: string,
  records: { recordType: string }[],
) => {
  // SAFETY: handleReading only destructures `message` and `serialNumber` off the
  // "reading" event, and both are set right below before the event is dispatched.
  const event = new Event("reading") as Event & {
    message: { records: { recordType: string }[] };
    serialNumber: string;
  };
  event.message = { records };
  event.serialNumber = serialNumber;
  reader.dispatchEvent(event);
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useExperimentalNfc", () => {
  it("reports supported: false when the Web NFC API is unavailable", () => {
    vi.stubGlobal("NDEFReader", undefined);

    const { result } = renderHook(() => useExperimentalNfc());

    expect(result.current.supported).toBe(false);
    expect(result.current.reading).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.scanning).toBe(false);
  });

  it("resolves false from scan/write/makeReadOnly when unsupported", async () => {
    vi.stubGlobal("NDEFReader", undefined);

    const { result } = renderHook(() => useExperimentalNfc());

    await expect(result.current.scan()).resolves.toBe(false);
    await expect(result.current.write("hello")).resolves.toBe(false);
    await expect(result.current.makeReadOnly()).resolves.toBe(false);
    expect(result.current.scanning).toBe(false);
  });

  it("reports supported: true when window.NDEFReader exists", () => {
    stubNdefReader(createReaderMock());

    const { result } = renderHook(() => useExperimentalNfc());

    expect(result.current.supported).toBe(true);
  });

  it("starts scanning and exposes the tags it reads", async () => {
    const reader = createReaderMock();
    stubNdefReader(reader);

    const { result } = renderHook(() => useExperimentalNfc());

    await act(async () => {
      await expect(result.current.scan()).resolves.toBe(true);
    });

    expect(result.current.scanning).toBe(true);
    expect(reader.scan).toHaveBeenCalledTimes(1);

    act(() => {
      fireReading(reader, "04:1a:2b", [{ recordType: "text" }]);
    });

    await waitFor(() => {
      expect(result.current.reading).toEqual({
        records: [{ recordType: "text" }],
        serialNumber: "04:1a:2b",
      });
    });
    expect(result.current.error).toBeUndefined();
  });

  it("sets an error when a tag in range can't be read", async () => {
    const reader = createReaderMock();
    stubNdefReader(reader);

    const { result } = renderHook(() => useExperimentalNfc());

    await act(async () => {
      await result.current.scan();
    });
    act(() => {
      reader.dispatchEvent(new Event("readingerror"));
    });

    await waitFor(() => {
      expect(result.current.error?.message).toBe("The NFC tag in range could not be read.");
    });
  });

  it("reports a rejected scan as an error and stays not scanning", async () => {
    const reader = createReaderMock({ scan: () => Promise.reject(new Error("denied")) });
    stubNdefReader(reader);

    const { result } = renderHook(() => useExperimentalNfc());

    await act(async () => {
      await expect(result.current.scan()).resolves.toBe(false);
    });

    expect(result.current.scanning).toBe(false);
    expect(result.current.error?.message).toBe("denied");
  });

  it("normalizes a non-Error rejection", async () => {
    // oxlint-disable-next-line prefer-promise-reject-errors -- exercising the non-Error rejection path the DOM can produce.
    const reader = createReaderMock({ scan: () => Promise.reject("nope") });
    stubNdefReader(reader);

    const { result } = renderHook(() => useExperimentalNfc());

    await act(async () => {
      await result.current.scan();
    });

    expect(result.current.error?.message).toBe("nope");
  });

  it("stops scanning and ignores later readings", async () => {
    const reader = createReaderMock();
    stubNdefReader(reader);

    const { result } = renderHook(() => useExperimentalNfc());

    await act(async () => {
      await result.current.scan();
    });
    act(() => {
      result.current.stop();
    });

    expect(result.current.scanning).toBe(false);

    act(() => {
      fireReading(reader, "ignored", [{ recordType: "text" }]);
    });

    expect(result.current.reading).toBeUndefined();
  });

  it("replaces the previous subscription when scan is called twice", async () => {
    const reader = createReaderMock();
    const NDEFReaderCtor = stubNdefReader(reader);

    const { result } = renderHook(() => useExperimentalNfc());

    await act(async () => {
      await result.current.scan();
    });
    await act(async () => {
      await result.current.scan();
    });

    expect(NDEFReaderCtor).toHaveBeenCalledTimes(2);

    act(() => {
      fireReading(reader, "04:ff", [{ recordType: "url" }]);
    });

    await waitFor(() => {
      expect(result.current.reading?.serialNumber).toBe("04:ff");
    });
  });

  it("detaches the listeners on unmount", async () => {
    const reader = createReaderMock();
    stubNdefReader(reader);
    const removeEventListener = vi.spyOn(reader, "removeEventListener");

    const { result, unmount } = renderHook(() => useExperimentalNfc());

    await act(async () => {
      await result.current.scan();
    });
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("reading", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("readingerror", expect.any(Function));
  });

  it("writes a message to the next tag in range", async () => {
    const reader = createReaderMock();
    stubNdefReader(reader);

    const { result } = renderHook(() => useExperimentalNfc());

    await act(async () => {
      await expect(result.current.write("hello", { overwrite: true })).resolves.toBe(true);
    });

    expect(reader.write).toHaveBeenCalledWith("hello", { overwrite: true });
    expect(result.current.error).toBeUndefined();
  });

  it("reports a failed write as an error", async () => {
    const reader = createReaderMock({ write: () => Promise.reject(new Error("read-only tag")) });
    stubNdefReader(reader);

    const { result } = renderHook(() => useExperimentalNfc());

    await act(async () => {
      await expect(result.current.write("hello")).resolves.toBe(false);
    });

    expect(result.current.error?.message).toBe("read-only tag");
  });

  it("makes a tag read-only", async () => {
    const reader = createReaderMock();
    stubNdefReader(reader);

    const { result } = renderHook(() => useExperimentalNfc());

    await act(async () => {
      await expect(result.current.makeReadOnly()).resolves.toBe(true);
    });

    expect(reader.makeReadOnly).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeUndefined();
  });

  it("reports a failed makeReadOnly as an error", async () => {
    const reader = createReaderMock({
      makeReadOnly: () => Promise.reject(new Error("not supported by tag")),
    });
    stubNdefReader(reader);

    const { result } = renderHook(() => useExperimentalNfc());

    await act(async () => {
      await expect(result.current.makeReadOnly()).resolves.toBe(false);
    });

    expect(result.current.error?.message).toBe("not supported by tag");
  });
});
