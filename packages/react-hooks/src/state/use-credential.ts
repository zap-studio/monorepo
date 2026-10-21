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
 * Wraps the Credential Management API (`navigator.credentials`).
 * Browsers use this to store WebAuthn (public-key) credentials — the only
 * credential type still supported; Password and Federated Credential
 * support was removed from both browsers and types. If the API isn't
 * supported, every method resolves
 * to `undefined` instead of throwing an error. `get()` and `create()` can
 * still resolve to `null`, just like the real API does, when there's no
 * credential to return. `supported` starts as `false`, which is also the
 * safe default during server-side rendering.
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
