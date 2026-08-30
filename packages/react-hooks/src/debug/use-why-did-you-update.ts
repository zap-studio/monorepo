import { useEffect, useRef } from "react";

import { isProductionBuild } from "./_env.ts";

/** One changed prop, as logged by `useWhyDidYouUpdate`. */
export interface ChangedProp {
  from: unknown;
  to: unknown;
}

// v8 ignore next -- server-side rendering picks this, and we test that part. But it only runs when React runs the effect, which needs a real browser commit with `NODE_ENV=production`. Tests cannot reach it, because bundlers replace `process.env.NODE_ENV` when this test suite is built, before a test can change it.
const noop = (): void => {};

/**
 * Logs which prop caused the current render. It prints a table (labeled
 * with `name`) showing `{ from, to }` for each prop that changed. If no
 * prop changed, it logs nothing — the render was probably caused by
 * state or context instead. Does nothing on the mount render (there's no
 * previous props to compare yet) or in production builds.
 *
 * @example
 * ```tsx
 * function UserCard(props: { name: string; age: number }) {
 *   useWhyDidYouUpdate("UserCard", props);
 *   return <div>{props.name}</div>;
 * }
 * ```
 */
export const useWhyDidYouUpdate = (name: string, props: Record<string, unknown>): void => {
  const previousPropsRef = useRef<Record<string, unknown> | undefined>(undefined);
  const skip = isProductionBuild();

  // oxlint-disable-next-line react-hooks/exhaustive-deps -- no deps array on purpose: this effect must compare props on every render, not just when some dependency changes. The rule cannot see that intent because the callback sits behind `skip ? noop : ...`, not a plain arrow function.
  useEffect(
    skip
      ? noop
      : () => {
          const previousProps = previousPropsRef.current;
          if (previousProps) {
            const changed: Record<string, ChangedProp> = {};
            const keys = new Set([...Object.keys(previousProps), ...Object.keys(props)]);
            for (const key of keys) {
              if (!Object.is(previousProps[key], props[key])) {
                changed[key] = { from: previousProps[key], to: props[key] };
              }
            }
            if (Object.keys(changed).length > 0) {
              // oxlint-disable-next-line no-console -- the whole point of this hook is to log a props diff for local debugging.
              console.log(`[why-did-you-update] ${name}`, changed);
            }
          }

          previousPropsRef.current = props;
        },
  );
};
