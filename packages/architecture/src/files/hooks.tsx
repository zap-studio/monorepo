import { L } from "../helpers/link.js";
import type { FileList } from "../types.js";

export const HooksFiles: FileList = {
  category: "HOOKS",
  entries: [
    {
      path: "src/hooks/use-mobile.ts",
      status: "added",
      required: true,
      children: (
        <>
          Custom hook for detecting mobile devices and handling mobile-specific
          logic. This is needed by{" "}
          <L href="https://ui.shadcn.com/">shadcn/ui</L>.
        </>
      ),
    },
    {
      path: "src/hooks/utils/use-body-scroll-lock.ts",
      status: "added",
      required: false,
      plugins: ["components"],
      children: (
        <>
          Custom hook for managing body scroll locking in modals and other
          components.
        </>
      ),
    },
    {
      path: "src/hooks/utils/use-cooldown.ts",
      status: "added",
      required: false,
      plugins: ["auth"],
      children: (
        <>
          Custom hook for implementing cooldowns on actions (e.g., mail
          ratelimits).
        </>
      ),
    },
  ],
};
