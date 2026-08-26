import { useCallback } from "react";

import {
  getContactsManager,
  type ContactInfo,
  type ContactProperty,
  type ContactSelectOptions,
} from "./_contact-picker-api.ts";

export type {
  ContactAddress,
  ContactInfo,
  ContactProperty,
  ContactSelectOptions,
} from "./_contact-picker-api.ts";

/** The shape returned by `useExperimentalContactPicker`. */
export interface UseExperimentalContactPickerResult {
  getProperties: () => Promise<ContactProperty[] | undefined>;
  select: (
    properties: ContactProperty[],
    options?: ContactSelectOptions,
  ) => Promise<ContactInfo[] | undefined>;
  supported: boolean;
}

const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === "AbortError";

/**
 * Wraps the Contact Picker API (`navigator.contacts`). This API is
 * experimental (see MDN), only works in Chromium browsers, and needs HTTPS
 * and a user action (like a click) to work.
 *
 * `select()` opens the OS contact picker for the properties you ask for. It
 * resolves with the chosen contacts, or `undefined` if the user cancels
 * (`AbortError`) or the API isn't supported. `getProperties()` resolves with
 * the list of `ContactProperty` values this browser can actually give you.
 *
 * @example
 * ```tsx
 * const { select, supported } = useExperimentalContactPicker();
 * const contacts = supported
 *   ? await select(["name", "email"], { multiple: true })
 *   : undefined;
 * ```
 */
export const useExperimentalContactPicker = (): UseExperimentalContactPickerResult => {
  const supported = Boolean(getContactsManager());

  const select = useCallback(
    async (
      properties: ContactProperty[],
      options?: ContactSelectOptions,
    ): Promise<ContactInfo[] | undefined> => {
      const contacts = getContactsManager();
      if (!contacts) {
        return undefined;
      }
      try {
        return await contacts.select(properties, options);
      } catch (error) {
        if (isAbortError(error)) {
          return undefined;
        }
        throw error;
      }
    },
    [],
  );

  const getProperties = useCallback(async (): Promise<ContactProperty[] | undefined> => {
    const contacts = getContactsManager();
    return contacts ? contacts.getProperties() : undefined;
  }, []);

  return { getProperties, select, supported };
};
