import { useCallback } from "react";

/** The shape returned by `useCredential`. */
export interface UseCredentialResult {
  create: (options?: CredentialCreationOptions) => Promise<Credential | null | undefined>;
  get: (options?: CredentialRequestOptions) => Promise<Credential | null | undefined>;
  preventSilentAccess: () => Promise<void>;
  store: (credential: Credential) => Promise<void>;
  supported: boolean;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.credentials !== "undefined";

/**
 * Wraps the Credential Management API (`navigator.credentials`) — the
 * browser's native store for WebAuthn (public-key) credentials, the
 * only credential type still typed by TypeScript's DOM lib (Password/
 * Federated Credential support was dropped from both browsers and
 * types). Every method resolves `undefined` — rather than throwing —
 * where the API is unsupported; `get()`/`create()` still resolve `null`
 * the way the underlying API does, when there's no credential to return.
 * `supported: false` is the SSR-safe default.
 *
 * @example
 * ```tsx
 * const { get, store, supported } = useCredential();
 * const credential = supported ? await get({ publicKey: requestOptions }) : undefined;
 * if (credential) await store(credential);
 * ```
 */
export const useCredential = (): UseCredentialResult => {
  const supported = isSupported();

  const get = useCallback(
    async (options?: CredentialRequestOptions): Promise<Credential | null | undefined> =>
      isSupported() ? navigator.credentials.get(options) : undefined,
    [],
  );

  const store = useCallback(async (credential: Credential): Promise<void> => {
    if (isSupported()) {
      await navigator.credentials.store(credential);
    }
  }, []);

  const create = useCallback(
    async (options?: CredentialCreationOptions): Promise<Credential | null | undefined> =>
      isSupported() ? navigator.credentials.create(options) : undefined,
    [],
  );

  const preventSilentAccess = useCallback(async (): Promise<void> => {
    if (isSupported()) {
      await navigator.credentials.preventSilentAccess();
    }
  }, []);

  return { create, get, preventSilentAccess, store, supported };
};
