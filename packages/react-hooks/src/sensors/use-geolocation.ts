import { useEffect, useState } from "react";

import { useIsClient } from "./use-is-client.ts";

/** The `coords` shape `useGeolocation` reports on success — a flattened `GeolocationCoordinates`. */
export interface GeolocationCoordinatesState {
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  latitude: number;
  longitude: number;
  speed: number | null;
}

/** The `error` shape `useGeolocation` reports on failure or when unsupported. */
export interface GeolocationErrorState {
  code: number;
  message: string;
}

/** The shape returned by `useGeolocation`. */
export interface GeolocationState {
  coords?: GeolocationCoordinatesState;
  error?: GeolocationErrorState;
  loading: boolean;
}

/** Options accepted by `useGeolocation`, passed through to the underlying `PositionOptions`. */
export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  watch?: boolean;
}

const INITIAL_STATE: GeolocationState = { loading: true };

const UNSUPPORTED_ERROR: GeolocationErrorState = {
  code: 0,
  message: "Geolocation is not supported by this browser.",
};

const toCoordsState = (position: GeolocationPosition): GeolocationCoordinatesState => ({
  accuracy: position.coords.accuracy,
  altitude: position.coords.altitude,
  altitudeAccuracy: position.coords.altitudeAccuracy,
  heading: position.coords.heading,
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  speed: position.coords.speed,
});

const toErrorState = (error: GeolocationPositionError): GeolocationErrorState => ({
  code: error.code,
  message: error.message,
});

/**
 * Wraps `navigator.geolocation`. By default it reads the position once
 * (`getCurrentPosition`). Pass `watch: true` to get continuous updates
 * instead (`watchPosition`, which stops via `clearWatch` when the
 * component unmounts or the options change). `loading` starts as `true`
 * and only changes on the client, so this is safe to use with server
 * rendering without any extra handling.
 *
 * @example
 * ```tsx
 * const { coords, loading, error } = useGeolocation();
 * // useGeolocation({ watch: true }) for continuous updates
 * ```
 */
export const useGeolocation = (options: UseGeolocationOptions = {}): GeolocationState => {
  const { enableHighAccuracy, maximumAge, timeout, watch = false } = options;

  const isClient = useIsClient();
  const supported = isClient && typeof navigator !== "undefined" && !!navigator.geolocation;

  const [state, setState] = useState<GeolocationState>(INITIAL_STATE);

  useEffect(() => {
    if (!supported) {
      return undefined;
    }

    const positionOptions: PositionOptions = {
      ...(enableHighAccuracy !== undefined && { enableHighAccuracy }),
      ...(maximumAge !== undefined && { maximumAge }),
      ...(timeout !== undefined && { timeout }),
    };

    const handleSuccess = (position: GeolocationPosition) => {
      setState({ coords: toCoordsState(position), loading: false });
    };

    const handleError = (error: GeolocationPositionError) => {
      setState({ error: toErrorState(error), loading: false });
    };

    if (watch) {
      // oxlint-disable-next-line sonarjs/no-intrusive-permissions -- tracking the location is what this hook does when you pass `watch: true`. The user asks for it, so the permission prompt is expected.
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        positionOptions,
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }

    // oxlint-disable-next-line sonarjs/no-intrusive-permissions -- reading the location once is what this hook does. The user calls it, so the permission prompt is expected.
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, positionOptions);
    return undefined;
  }, [supported, enableHighAccuracy, maximumAge, timeout, watch]);

  return isClient && !supported ? { error: UNSUPPORTED_ERROR, loading: false } : state;
};
