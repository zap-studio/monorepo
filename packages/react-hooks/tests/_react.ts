import type { RenderHookOptions, RenderHookResult } from "vitest-browser-react";

import { act as reactAct } from "react";
import { renderHook as baseRenderHook } from "vitest-browser-react";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

/** React's `act`, which warns unless the act environment is on for the call. */
export const act = async (callback: () => Promise<unknown> | void): Promise<void> => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  try {
    await reactAct(callback);
  } finally {
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  }
};

/** `renderHook`, with the callback's props required instead of `Props | undefined`. */
export const renderHook =
  // SAFETY: narrows the callback's parameter only; the runtime function is untouched.
  baseRenderHook as {
    <Result>(renderCallback: () => Result): Promise<RenderHookResult<Result, never>>;
    <Props, Result>(
      renderCallback: (props: Props) => Result,
      options: RenderHookOptions<Props> & { initialProps: Props },
    ): Promise<RenderHookResult<Result, Props>>;
  };
