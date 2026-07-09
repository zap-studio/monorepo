import type { StandardSchemaV1 } from "@standard-schema/spec";
import { bench, describe } from "vitest";

import {
  createStandardValidator,
  createSyncStandardValidator,
  standardValidate,
  standardValidateSync,
} from "../src/index.js";

const syncSchema: StandardSchemaV1<unknown, string> = {
  "~standard": {
    validate: (input: unknown) => ({
      value: String(input),
    }),
    vendor: "benchmark",
    version: 1,
  },
};

const asyncSchema: StandardSchemaV1<unknown, string> = {
  "~standard": {
    validate: async (input: unknown) => {
      await Promise.resolve();
      return {
        value: String(input),
      };
    },
    vendor: "benchmark",
    version: 1,
  },
};

const input = { id: 42, name: "Ada" };

const reusableAsync = createStandardValidator(syncSchema);
const reusableSync = createSyncStandardValidator(syncSchema);

describe("@zap-studio/validation | core | api", () => {
  bench("zap | standardValidate | sync-schema", async () => {
    await standardValidate(syncSchema, input);
  });

  bench("zap | standardValidate | async-schema", async () => {
    await standardValidate(asyncSchema, input);
  });

  bench("zap | createStandardValidator | reused", async () => {
    await reusableAsync(input);
  });

  bench("zap | standardValidateSync", () => {
    standardValidateSync(syncSchema, input);
  });

  bench("zap | createSyncStandardValidator | reused", () => {
    reusableSync(input);
  });
});
