/**
 * One place to cast test doubles and fake fixtures to a type they do not fully
 * match. This keeps `as unknown as X` chains out of the test bodies. Only use it
 * for a double whose missing members the code under test never touches, and say
 * which members those are at the call site.
 *
 * Not a hook and not shipped: the `_` prefix on the filename excludes it from
 * the build.
 */
export const asTestDouble = <T>(value: unknown): T =>
  // SAFETY: the single place in this package's tests where a shape is asserted rather
  // than checked. Every call site states what the code under test reads off the double.
  value as T;
