/** Minimal local model of the Contact Picker API — Experimental per MDN, Chromium-only, not declared in every TypeScript DOM lib. */
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

/** A single contact returned by `ContactsManager.select()` — only the requested `ContactProperty` fields are populated. */
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
 * Guards `typeof navigator === "undefined"` because `useExperimentalContactPicker`
 * reads this synchronously in the hook body, on every render including SSR —
 * not just from an effect.
 */
export const getContactsManager = (): ContactsManager | undefined => {
  if (typeof navigator === "undefined") {
    return undefined;
  }
  // SAFETY: navigator.contacts is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent (Safari, Firefox) degrades to undefined rather than throwing.
  return (navigator as NavigatorWithContacts).contacts;
};
