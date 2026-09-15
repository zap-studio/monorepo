import type { RenderHookOptions, RenderHookResult } from "vitest-browser-react";

import { act as reactAct } from "react";
import { renderHook as baseRenderHook } from "vitest-browser-react";

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

/**
 * React's `act` with the act environment enabled for the duration of the call.
 *
 * `vitest-browser-react` only enables `IS_REACT_ACT_ENVIRONMENT` around its own
 * renders, so calling React's `act` directly from a test would warn.
 */
export const act = async (callback: () => Promise<unknown> | void): Promise<void> => {
  const previous = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  try {
    await reactAct(callback);
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous;
  }
};

/**
 * `renderHook` from `vitest-browser-react`, with the render callback's props
 * typed as required whenever `initialProps` is passed.
 *
 * Upstream types the callback as `(props?: Props) => Result` so that a
 * no-argument `rerender()` type-checks, which would otherwise force every
 * props-taking callback in a test to handle `undefined`.
 */
export const renderHook =
  // SAFETY: the assertion only narrows the callback's parameter, so any call that
  // type-checks against this signature also type-checks against the upstream one.
  // The runtime function is untouched.
  baseRenderHook as {
    <Result>(renderCallback: () => Result): Promise<RenderHookResult<Result, never>>;
    <Props, Result>(
      renderCallback: (props: Props) => Result,
      options: RenderHookOptions<Props> & { initialProps: Props },
    ): Promise<RenderHookResult<Result, Props>>;
  };
