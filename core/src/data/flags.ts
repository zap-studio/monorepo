import { flag } from "flags/next";

import { ZAP_DEFAULT_FLAGS } from "@/zap.config";

export const FLAGS = {
  ...ZAP_DEFAULT_FLAGS,
  EXAMPLE_FLAG: flag({
    key: "example-flag",
    defaultValue: false,
    decide: () => false,
  }),
};
