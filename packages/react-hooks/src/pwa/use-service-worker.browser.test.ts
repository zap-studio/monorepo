import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useServiceWorker } from "./use-service-worker.ts";

const createInstallingWorker = (): ServiceWorker => {
  const worker = new EventTarget() as ServiceWorker;
  Object.defineProperty(worker, "state", {
    configurable: true,
    value: "installing",
    writable: true,
  });
  return worker;
};

const createRegistration = (installing: ServiceWorker | null): ServiceWorkerRegistration => {
  const registration = new EventTarget() as ServiceWorkerRegistration;
  Object.defineProperty(registration, "installing", { configurable: true, value: installing });
  return registration;
};

const setServiceWorkerContainer = (
  container:
    | {
        controller: ServiceWorker | null;
        getRegistration: () => Promise<ServiceWorkerRegistration | undefined>;
      }
    | undefined,
) => {
  Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: container });
};

afterEach(() => {
  setServiceWorkerContainer(undefined);
});

describe("useServiceWorker", () => {
  it("reports supported: false when navigator.serviceWorker is unavailable", () => {
    setServiceWorkerContainer(undefined);

    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.supported).toBe(false);
    expect(result.current.registration).toBeUndefined();
  });

  it("reports supported: true and picks up an existing registration", async () => {
    const registration = createRegistration(null);
    setServiceWorkerContainer({
      controller: null,
      getRegistration: () => Promise.resolve(registration),
    });

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.supported).toBe(true);
    expect(result.current.registration).toBe(registration);
    expect(result.current.updateAvailable).toBe(false);
  });

  it("stays without a registration when getRegistration() resolves undefined", async () => {
    setServiceWorkerContainer({
      controller: null,
      getRegistration: () => Promise.resolve(undefined),
    });

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.registration).toBeUndefined();
  });

  it("becomes updateAvailable: true once a new worker installs while a controller is active", async () => {
    const worker = createInstallingWorker();
    const registration = createRegistration(worker);
    setServiceWorkerContainer({
      controller: {} as ServiceWorker,
      getRegistration: () => Promise.resolve(registration),
    });

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await Promise.resolve();
      registration.dispatchEvent(new Event("updatefound"));
    });

    await act(async () => {
      Object.defineProperty(worker, "state", { configurable: true, value: "installed" });
      worker.dispatchEvent(new Event("statechange"));
    });

    expect(result.current.updateAvailable).toBe(true);
  });

  it("does not flag updateAvailable when installed with no active controller (first install)", async () => {
    const worker = createInstallingWorker();
    const registration = createRegistration(worker);
    setServiceWorkerContainer({
      controller: null,
      getRegistration: () => Promise.resolve(registration),
    });

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await Promise.resolve();
      registration.dispatchEvent(new Event("updatefound"));
    });

    await act(async () => {
      Object.defineProperty(worker, "state", { configurable: true, value: "installed" });
      worker.dispatchEvent(new Event("statechange"));
    });

    expect(result.current.updateAvailable).toBe(false);
  });

  it("ignores updatefound when the registration has no installing worker", async () => {
    const registration = createRegistration(null);
    setServiceWorkerContainer({
      controller: {} as ServiceWorker,
      getRegistration: () => Promise.resolve(registration),
    });

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await Promise.resolve();
      registration.dispatchEvent(new Event("updatefound"));
    });

    expect(result.current.updateAvailable).toBe(false);
  });

  it("ignores a resolved registration if the component unmounted first", async () => {
    let resolveRegistration: (value: ServiceWorkerRegistration | undefined) => void = vi.fn();
    const pending = new Promise<ServiceWorkerRegistration | undefined>((resolve) => {
      resolveRegistration = resolve;
    });
    setServiceWorkerContainer({ controller: null, getRegistration: () => pending });

    const { result, unmount } = renderHook(() => useServiceWorker());
    unmount();

    await act(async () => {
      resolveRegistration(createRegistration(null));
      await pending;
    });

    expect(result.current.registration).toBeUndefined();
  });
});
