import { useEffect, useState } from "react";

export interface GeolocationCoordinatesState {
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  latitude: number;
  longitude: number;
  speed: number | null;
}

export interface GeolocationErrorState {
  code: number;
  message: string;
}

export interface GeolocationState {
  coords?: GeolocationCoordinatesState;
  error?: GeolocationErrorState;
  loading: boolean;
}

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
 * Wraps `navigator.geolocation`. One-shot by default (`getCurrentPosition`);
 * pass `watch: true` for continuous updates (`watchPosition`, cleaned up via
 * `clearWatch` on unmount or option change). `loading` starts `true` and the
 * effect — client-only — resolves it, so this is SSR-safe with no extra
 * handling needed.
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
      // oxlint-disable-next-line sonarjs/no-intrusive-permissions -- Continuous location tracking is this hook's entire purpose (watch: true); the permission prompt is the expected, user-visible consequence of opting in.
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        positionOptions,
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }

    // oxlint-disable-next-line sonarjs/no-intrusive-permissions -- One-shot location read is this hook's entire purpose; the permission prompt is the expected, user-visible consequence of calling it.
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, positionOptions);
    return undefined;
  }, [enableHighAccuracy, maximumAge, timeout, watch]);

  return state;
};
