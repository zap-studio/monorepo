/** A simple local copy of the Contact Picker API types. This API is experimental (see MDN), only works in Chromium browsers, and not every version of TypeScript's DOM types includes it. */
export type ContactProperty = "address" | "email" | "icon" | "name" | "tel";

/** A single postal address, as returned in a `ContactInfo`'s `address` field. */
export interface ContactAddress {
  readonly addressLine: readonly string[];
  readonly city: string;
  readonly country: string;
  readonly dependentLocality: string;
  readonly organization: string;
  readonly phone: string;
  readonly postalCode: string;
  readonly recipient: string;
  readonly region: string;
  readonly sortingCode: string;
}

/** A single contact returned by `ContactsManager.select()`. Only the fields you requested via `ContactProperty` are filled in. */
export interface ContactInfo {
  address?: ContactAddress[];
  email?: string[];
  icon?: Blob[];
  name?: string[];
  tel?: string[];
}

/** Options `ContactsManager.select()` accepts, beyond which properties to request. */
export interface ContactSelectOptions {
  multiple?: boolean;
}

interface ContactsManager {
  getProperties(): Promise<ContactProperty[]>;
  select(properties: ContactProperty[], options?: ContactSelectOptions): Promise<ContactInfo[]>;
}

interface NavigatorWithContacts extends Navigator {
  readonly contacts?: ContactsManager;
}

/**
 * Checks for `typeof navigator === "undefined"`. This is needed because
 * `useExperimentalContactPicker` calls this function directly during render
 * (including on the server), not just inside an effect.
 */
export const getContactsManager = (): ContactsManager | undefined => {
  if (typeof navigator === "undefined") {
    return undefined;
  }
  // SAFETY: we read navigator.contacts as optional, no matter what the current TypeScript DOM types say. This way, a browser that doesn't have it (Safari, Firefox) just gives us undefined instead of an error.
  return (navigator as NavigatorWithContacts).contacts;
};
