import { type } from "arktype";
import * as v from "valibot";
import { z } from "zod";

import {
  createStandardValidator,
  createSyncStandardValidator,
} from "../../src/index.js";

export const nativeZodSyncSchema = z.object({
  active: z.boolean(),
  age: z.number().int().min(0),
  email: z.email(),
  name: z.string().min(1),
});

export const nativeZodAsyncSchema = nativeZodSyncSchema.refine(
  async () => true
);

export const nativeArktypeSyncSchema = type({
  active: "boolean",
  age: "number.integer >= 0",
  email: "string.email",
  name: "string > 0",
});

export const nativeValibotSyncSchema = v.object({
  active: v.boolean(),
  age: v.pipe(v.number(), v.integer(), v.minValue(0)),
  email: v.pipe(v.string(), v.email()),
  name: v.pipe(v.string(), v.minLength(1)),
});

export const zapZodSyncValidator =
  createSyncStandardValidator(nativeZodSyncSchema);
export const zapArktypeSyncValidator = createSyncStandardValidator(
  nativeArktypeSyncSchema
);
export const zapValibotSyncValidator = createSyncStandardValidator(
  nativeValibotSyncSchema
);

export const zapZodAsyncValidator =
  createStandardValidator(nativeZodAsyncSchema);
export const zapValibotAsyncValidator = createStandardValidator(
  nativeValibotSyncSchema
);

export const nativeZodSyncStandardValidate =
  nativeZodSyncSchema["~standard"].validate;
export const nativeArktypeSyncStandardValidate =
  nativeArktypeSyncSchema["~standard"].validate;
export const nativeValibotSyncStandardValidate =
  nativeValibotSyncSchema["~standard"].validate;

export const nativeZodAsyncStandardValidate =
  nativeZodAsyncSchema["~standard"].validate;
export const nativeValibotAsyncStandardValidate =
  nativeValibotSyncSchema["~standard"].validate;
