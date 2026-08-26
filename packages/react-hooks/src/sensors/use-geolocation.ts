import { useEffect, useState } from "react";

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

  const [state, setState] = useState<GeolocationState>(INITIAL_STATE);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ error: UNSUPPORTED_ERROR, loading: false });
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
      // oxlint-disable-next-line sonarjs/no-intrusive-permissions -- Continuous location tracking is exactly what this hook does when `watch: true` is passed. The permission prompt is expected here, since the user chose to opt in.
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        positionOptions,
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }

    // oxlint-disable-next-line sonarjs/no-intrusive-permissions -- Reading the location once is exactly what this hook does. The permission prompt is expected when the user calls it.
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, positionOptions);
    return undefined;
  }, [enableHighAccuracy, maximumAge, timeout, watch]);

  return state;
};
