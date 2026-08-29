import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { useIndexedDB } from "./use-indexed-db.ts";

// `.error` is a raw string, not an Error instance — this matches real IndexedDB
// behavior, where `.error` is a DOMException (which does not extend Error), so
// these tests also exercise the `caught instanceof Error` false branch downstream.
interface FailingRequestFixture {
  error: string;
  onerror?: (() => void) | null;
  onsuccess?: (() => void) | null;
}

const makeFailingRequest = (errorMessage: string): IDBRequest => {
  const fake: FailingRequestFixture = {
    error: errorMessage,
  };
  queueMicrotask(() => fake.onerror?.());
  // SAFETY: this fake only fires onerror. It needs only the members useIndexedDB uses on a failing request: error (read in onerror) and the onerror/onsuccess handler slots the hook sets.
  return asTestDouble<IDBRequest>(fake);
};

interface SuccessfulReadFixture {
  onsuccess?: (() => void) | null;
  result?: number;
}

interface FailingTransactionFixture<Store> {
  error: unknown;
  objectStore: () => Store;
  oncomplete?: (() => void) | null;
  onerror?: (() => void) | null;
}

const makeFailingTransaction = (error: unknown): IDBTransaction => {
  const fakeStore = {
    delete: vi.fn<(key: string) => IDBRequest>(),
    get: vi.fn<(key: string) => IDBRequest>(),
    put: vi.fn<(value: unknown, key: string) => IDBRequest>(),
  };
  const fake: FailingTransactionFixture<typeof fakeStore> = {
    error,
    objectStore: () => fakeStore,
  };
  queueMicrotask(() => fake.onerror?.());
  // SAFETY: this fake has only what putValue/deleteValue use on a transaction: objectStore() returning a store with put/delete/get, the oncomplete/onerror handler slots, and error, read in onerror.
  return asTestDouble<IDBTransaction>(fake);
};

// A fully-controlled fake IDBOpenDBRequest whose onupgradeneeded/onsuccess fire
// via a microtask, with a fake `db.transaction(...).objectStore(...).get()`
// wired to `getRequest` — lets tests control read-timing precisely, instead of
// racing a real (and much slower) native IndexedDB open.
const makeControlledOpenRequest = (options: {
  getRequest?: () => IDBRequest;
  storeExists: boolean;
}) => {
  let onupgradeneeded: (() => void) | undefined;
  let onsuccess: (() => void) | undefined;
  const createObjectStore = vi.fn<(name: string) => void>();
  const fakeDb = {
    close: vi.fn<() => void>(),
    createObjectStore,
    objectStoreNames: { contains: () => options.storeExists },
    transaction: () => ({ objectStore: () => ({ get: options.getRequest }) }),
  };
  const fake = {
    get onupgradeneeded() {
      return onupgradeneeded;
    },
    set onupgradeneeded(fn: (() => void) | undefined) {
      onupgradeneeded = fn;
    },
    get onsuccess() {
      return onsuccess;
    },
    set onsuccess(fn: (() => void) | undefined) {
      onsuccess = fn;
    },
    set onerror(_fn: unknown) {
      // never fires in this fake — open always "succeeds" here
    },
    result: fakeDb,
  };
  queueMicrotask(() => {
    onupgradeneeded?.();
    onsuccess?.();
  });
  // SAFETY: the fake has exactly what openDatabase sets and reads on the open request: the onupgradeneeded, onsuccess and onerror setters, and the result getter. The queueMicrotask above drives it by hand instead of a real async open.
  return { createObjectStore, request: asTestDouble<IDBOpenDBRequest>(fake) };
};

const deleteTestDatabase = (): Promise<void> => {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase("zap-studio-react-hooks");
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
};

beforeEach(async () => {
  await deleteTestDatabase();
});

afterEach(async () => {
  vi.restoreAllMocks();
  await deleteTestDatabase();
});

describe("useIndexedDB", () => {
  it('starts "loading" with the initial value', () => {
    const { result } = renderHook(() => useIndexedDB("count", 0));

    expect(result.current.status).toBe("loading");
    expect(result.current.value).toBe(0);
  });

  it('becomes "ready" with the initial value when nothing is stored', async () => {
    const { result } = renderHook(() => useIndexedDB("count", 0));

    await waitFor(() => expect(result.current.status).toBe("ready"));

    expect(result.current.value).toBe(0);
  });

  it("setValue() writes through and is read back on the next mount", async () => {
    const { result, unmount } = renderHook(() => useIndexedDB("count", 0));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => {
      await result.current.setValue(5);
    });
    expect(result.current.value).toBe(5);

    unmount();

    const { result: second } = renderHook(() => useIndexedDB("count", 0));
    await waitFor(() => expect(second.current.status).toBe("ready"));
    expect(second.current.value).toBe(5);
  });

  it("setValue() accepts a functional updater based on the latest value", async () => {
    const { result } = renderHook(() => useIndexedDB("count", 0));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => {
      await result.current.setValue((prev) => prev + 1);
    });
    await act(async () => {
      await result.current.setValue((prev) => prev + 1);
    });

    expect(result.current.value).toBe(2);
  });

  it("remove() clears the stored value and resets to the initial value", async () => {
    const { result } = renderHook(() => useIndexedDB("count", 0));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    await act(async () => {
      await result.current.setValue(5);
    });
    await act(async () => {
      await result.current.remove();
    });

    expect(result.current.value).toBe(0);
  });

  it("skips creating the object store when onupgradeneeded reports it already exists", async () => {
    const { createObjectStore, request } = makeControlledOpenRequest({ storeExists: true });
    vi.spyOn(indexedDB, "open").mockReturnValue(request);

    renderHook(() => useIndexedDB("count", 0));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(createObjectStore).not.toHaveBeenCalled();
  });

  it("ignores a resolved read if the component unmounted first", async () => {
    const { request } = makeControlledOpenRequest({
      getRequest: () => {
        const fake: SuccessfulReadFixture = { result: 1 };
        queueMicrotask(() => fake.onsuccess?.());
        // SAFETY: getValue's success path only sets request.onsuccess and reads request.result. This small fake, driven by the queueMicrotask above, is enough as an IDBRequest when the read succeeds.
        return asTestDouble<IDBRequest>(fake);
      },
      storeExists: true,
    });
    vi.spyOn(indexedDB, "open").mockReturnValue(request);

    const { result, unmount } = renderHook(() => useIndexedDB("count", 0));
    unmount();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.status).toBe("loading");
    expect(result.current.value).toBe(0);
  });

  it("ignores a failed read if the component unmounted first", async () => {
    const { request } = makeControlledOpenRequest({
      getRequest: () => makeFailingRequest("read boom"),
      storeExists: true,
    });
    vi.spyOn(indexedDB, "open").mockReturnValue(request);

    const { result, unmount } = renderHook(() => useIndexedDB("count", 0));
    unmount();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.status).toBe("loading");
  });

  it("keeps separate values per key", async () => {
    const { result: a } = renderHook(() => useIndexedDB("a", "x"));
    const { result: b } = renderHook(() => useIndexedDB("b", "y"));
    await waitFor(() => expect(a.current.status).toBe("ready"));
    await waitFor(() => expect(b.current.status).toBe("ready"));

    await act(async () => {
      await a.current.setValue("changed");
    });

    expect(a.current.value).toBe("changed");
    expect(b.current.value).toBe("y");
  });

  it('becomes "error" when opening the database fails', async () => {
    vi.spyOn(indexedDB, "open").mockImplementation(
      // SAFETY: this simulates open() itself failing. openDatabase only uses the request members that makeFailingRequest already fakes (error, onerror). The other IDBOpenDBRequest members, like onupgradeneeded, are never reached before onerror fires.
      () => asTestDouble<IDBOpenDBRequest>(makeFailingRequest("open boom")),
    );

    const { result } = renderHook(() => useIndexedDB("count", 0));
    await waitFor(() => expect(result.current.status).toBe("error"));

    expect(result.current.error?.message).toBe("open boom");
  });

  it('becomes "error" when the initial read request fails', async () => {
    vi.spyOn(IDBObjectStore.prototype, "get").mockImplementation(() =>
      makeFailingRequest("read boom"),
    );

    const { result } = renderHook(() => useIndexedDB("count", 0));
    await waitFor(() => expect(result.current.status).toBe("error"));

    expect(result.current.error?.message).toBe("read boom");
  });

  it("setValue() sets an error when the write transaction fails", async () => {
    const { result } = renderHook(() => useIndexedDB("count", 0));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    vi.spyOn(IDBDatabase.prototype, "transaction").mockImplementation(() =>
      makeFailingTransaction("write boom"),
    );

    await act(async () => {
      await result.current.setValue(5);
    });

    expect(result.current.error?.message).toBe("write boom");
    expect(result.current.status).toBe("error");
  });

  it("setValue() passes through a real Error thrown by the transaction as-is", async () => {
    const { result } = renderHook(() => useIndexedDB("count", 0));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    vi.spyOn(IDBDatabase.prototype, "transaction").mockImplementation(() =>
      makeFailingTransaction(new Error("write boom (real)")),
    );

    await act(async () => {
      await result.current.setValue(5);
    });

    expect(result.current.error?.message).toBe("write boom (real)");
  });

  it("remove() passes through a real Error thrown by the transaction as-is", async () => {
    const { result } = renderHook(() => useIndexedDB("count", 0));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    vi.spyOn(IDBDatabase.prototype, "transaction").mockImplementation(() =>
      makeFailingTransaction(new Error("delete boom (real)")),
    );

    await act(async () => {
      await result.current.remove();
    });

    expect(result.current.error?.message).toBe("delete boom (real)");
  });

  it("remove() sets an error when the delete transaction fails", async () => {
    const { result } = renderHook(() => useIndexedDB("count", 0));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    vi.spyOn(IDBDatabase.prototype, "transaction").mockImplementation(() =>
      makeFailingTransaction("delete boom"),
    );

    await act(async () => {
      await result.current.remove();
    });

    expect(result.current.error?.message).toBe("delete boom");
    expect(result.current.status).toBe("error");
  });

  it('reports supported: false-equivalent "error" status when IndexedDB is unavailable', async () => {
    const original = window.indexedDB;
    Reflect.deleteProperty(window, "indexedDB");

    const { result } = renderHook(() => useIndexedDB("count", 0));
    await waitFor(() => expect(result.current.status).toBe("error"));

    expect(result.current.error).toBeInstanceOf(Error);

    Object.defineProperty(window, "indexedDB", { configurable: true, value: original });
  });
});
