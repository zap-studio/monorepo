---
name: zap-validation-standard-schema
description: >
  Validate unknown data with @zap-studio/validation using isStandardSchema,
  standardValidate/standardValidateSync, createStandardValidator,
  createSyncStandardValidator, and throwOnError result/exception modes.
type: core
library: '@zap-studio/validation'
library_version: '0.3.1'
sources:
  - 'zap-studio/monorepo:packages/validation/README.md'
  - 'zap-studio/monorepo:packages/validation/src/index.ts'
  - 'zap-studio/monorepo:packages/validation/src/errors.ts'
---

# @zap-studio/validation — Standard Schema Validation

## Setup

```ts
import { standardValidate, ValidationError } from '@zap-studio/validation';
import { z } from 'zod';

const UserSchema = z.object({ id: z.string(), email: z.string().email() });

try {
  const user = await standardValidate(UserSchema, { id: '1', email: 'a@b.com' }, {
    throwOnError: true,
  });
  console.log(user.id);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.issues);
  }
}
```

## Core Patterns

### Use non-throw mode for explicit branching

```ts
import { standardValidate } from '@zap-studio/validation';

const result = await standardValidate(UserSchema, payload);
if (result.issues) {
  return { ok: false, issues: result.issues };
}

return { ok: true, value: result.value };
```

### Build reusable validators

```ts
import { createStandardValidator } from '@zap-studio/validation';

const validateUser = createStandardValidator(UserSchema);
const output = await validateUser(payload, { throwOnError: true });
```

### Guard unknown schema-like values

```ts
import { isStandardSchema, standardValidate } from '@zap-studio/validation';

async function validateMaybeSchema(schemaLike: unknown, input: unknown) {
  if (!isStandardSchema(schemaLike)) {
    throw new Error('Unsupported schema');
  }
  return standardValidate(schemaLike, input);
}
```

## Common Mistakes

### HIGH Calling sync helper on async schema

Wrong:

```ts
const value = standardValidateSync(asyncSchema, payload, { throwOnError: true });
```

Correct:

```ts
const value = await standardValidate(asyncSchema, payload, {
  throwOnError: true,
});
```

`standardValidateSync` throws when schema validation returns a Promise.

Source: zap-studio/monorepo:packages/validation/src/index.ts

### HIGH Treating non-throw result as parsed value

Wrong:

```ts
const user = await standardValidate(UserSchema, payload);
console.log(user.id);
```

Correct:

```ts
const result = await standardValidate(UserSchema, payload);
if (result.issues) throw new Error('invalid payload');
console.log(result.value.id);
```

Default mode returns `{ value?, issues? }`, not direct parsed output.

Source: zap-studio/monorepo:packages/validation/src/index.ts

### MEDIUM Skipping runtime schema guard for unknown inputs

Wrong:

```ts
await standardValidate(schemaLike as any, payload);
```

Correct:

```ts
if (!isStandardSchema(schemaLike)) throw new Error('Unsupported schema');
await standardValidate(schemaLike, payload);
```

Validation helpers expect Standard Schema-compatible values and rely on `~standard.validate` at runtime.

Source: zap-studio/monorepo:packages/validation/src/index.ts
