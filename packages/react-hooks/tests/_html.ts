/**
 * Identity tag for HTML string fixtures in SSR assertions. Not a hook and not
 * shipped: the `_` prefix on the filename excludes it from the build.
 *
 * These fixtures are static test literals compared against `renderToString`
 * output, never inserted into a live DOM, so no escaping is needed — this tag
 * exists only to satisfy `github/unescaped-html-literal`, which requires an
 * `html` tagged template for any string literal starting with `<letter`.
 */
export const html = (
  strings: TemplateStringsArray,
  ...values: readonly (number | string)[]
): string => strings.reduce((result, part, index) => result + part + (values[index] ?? ""), "");
