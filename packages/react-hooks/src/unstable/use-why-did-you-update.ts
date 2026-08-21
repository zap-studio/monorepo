import { useEffect, useRef } from "react";

import { isProductionBuild } from "./_env.ts";

/** One changed prop, as logged by `useWhyDidYouUpdate`. */
export interface ChangedProp {
  from: unknown;
  to: unknown;
}

/**
 * Logs which of `props`' keys changed to cause the current render —
 * `console.log`s a `name`-labeled table of `{ from, to }` per changed key,
 * or nothing when no key changed (a render caused by state/context rather
 * than these particular props). Does nothing on the mount render, since
 * there's no previous `props` to diff against. No-ops entirely in
 * production builds.
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

  useEffect(
    skip
      ? () => {}
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
              // oxlint-disable-next-line no-console -- this hook's entire purpose is logging a props diff for local debugging.
              console.log(`[why-did-you-update] ${name}`, changed);
            }
          }

          previousPropsRef.current = props;
        },
  );
};
