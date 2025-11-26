/**
 * Type guard to check if a value is a plain object
 */
export function isPlainObject(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}
