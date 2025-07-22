import { flag } from "flags/next";

export const FLAGS = {
  EXAMPLE_FLAG: flag({
    key: "example-flag",
    defaultValue: false,
    decide: () => false,
  }),
};
