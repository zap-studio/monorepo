import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useGeolocation } from "./use-geolocation.ts";

const createGeolocationMock = () => {
  return {
    clearWatch: vi.fn(),
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(() => 1),
  };
};

const setNavigatorGeolocation = (
  geolocation: ReturnType<typeof createGeolocationMock> | undefined,
) => {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    get: () => geolocation,
  });
};

const fakePosition = {
  coords: {
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: 48.8566,
    longitude: 2.3522,
    speed: null,
  },
  timestamp: 0,
};

const fakeError = { code: 1, message: "User denied Geolocation" };

describe(useGeolocation, () => {
  it("starts in a loading state", () => {
    const geolocation = createGeolocationMock();
    setNavigatorGeolocation(geolocation);

    const { result } = renderHook(() => useGeolocation());

    expect(result.current).toEqual({ coords: undefined, error: undefined, loading: true });
  });

  it("reports coords once getCurrentPosition succeeds", async () => {
    const geolocation = createGeolocationMock();
    setNavigatorGeolocation(geolocation);

    const { result } = renderHook(() => useGeolocation());
    const onSuccess = geolocation.getCurrentPosition.mock.calls[0]?.[0];

    await act(async () => {
      onSuccess?.(fakePosition);
    });

    expect(result.current).toEqual({
      coords: {
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 48.8566,
        longitude: 2.3522,
        speed: null,
      },
      error: undefined,
      loading: false,
    });
  });

  it("reports an error when getCurrentPosition fails", async () => {
    const geolocation = createGeolocationMock();
    setNavigatorGeolocation(geolocation);

    const { result } = renderHook(() => useGeolocation());
    const onError = geolocation.getCurrentPosition.mock.calls[0]?.[1];

    await act(async () => {
      onError?.(fakeError);
    });

    expect(result.current).toEqual({ coords: undefined, error: fakeError, loading: false });
  });

  it("uses watchPosition and clears the watch on unmount when watch: true", () => {
    const geolocation = createGeolocationMock();
    setNavigatorGeolocation(geolocation);

    const { unmount } = renderHook(() => useGeolocation({ watch: true }));

    expect(geolocation.watchPosition).toHaveBeenCalledTimes(1);
    expect(geolocation.getCurrentPosition).not.toHaveBeenCalled();

    unmount();

    expect(geolocation.clearWatch).toHaveBeenCalledWith(1);
  });

  it("reports an error when geolocation is unsupported", () => {
    setNavigatorGeolocation(undefined);

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.loading).toBe(false);
    expect(result.current.coords).toBeUndefined();
    expect(result.current.error?.message).toBe("Geolocation is not supported by this browser.");
  });

  it("forwards enableHighAccuracy/maximumAge/timeout to getCurrentPosition", () => {
    const geolocation = createGeolocationMock();
    setNavigatorGeolocation(geolocation);

    renderHook(() => useGeolocation({ enableHighAccuracy: true, maximumAge: 5000, timeout: 3000 }));

    expect(geolocation.getCurrentPosition.mock.calls[0]?.[2]).toEqual({
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 3000,
    });
  });
});
