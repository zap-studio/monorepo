---
name: zap-fetch-typed-http
description: >
  Implement type-safe HTTP requests with @zap-studio/fetch using $fetch,
  api.get/post/put/patch/delete, createFetch defaults, searchParams merging,
  and throwOnFetchError/throwOnValidationError return modes.
type: core
library: '@zap-studio/fetch'
library_version: '0.4.6'
sources:
  - 'zap-studio/monorepo:packages/fetch/README.md'
  - 'zap-studio/monorepo:packages/fetch/src/index.ts'
  - 'zap-studio/monorepo:packages/fetch/src/utils.ts'
---

# @zap-studio/fetch — Typed HTTP Client

## Setup

```ts
import { createFetch } from '@zap-studio/fetch';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const { api } = createFetch({
  baseURL: 'https://api.example.com',
  headers: { Authorization: 'Bearer token' },
  searchParams: { locale: 'en' },
});

const user = await api.get('/users/1', UserSchema);
```

## Core Patterns

### Return raw `Response` when no schema is provided

```ts
import { $fetch } from '@zap-studio/fetch';

const response = await $fetch('https://api.example.com/health');
const data = await response.json();
```

### Request validated payload via schema

```ts
import { api } from '@zap-studio/fetch';
import { z } from 'zod';

const PostSchema = z.object({ id: z.number(), title: z.string() });
const post = await api.get('https://api.example.com/posts/1', PostSchema);
```

### Handle non-throw validation mode explicitly

```ts
import { $fetch } from '@zap-studio/fetch';
import { z } from 'zod';

const UserSchema = z.object({ id: z.number() });

const result = await $fetch('/users/1', UserSchema, {
  throwOnValidationError: false,
});

if (result.issues) {
  throw new Error('Invalid response payload');
}

console.log(result.value.id);
```

## Common Mistakes

### HIGH Assuming `api.get` returns raw `Response`

Wrong:

```ts
const res = await api.get('/users/1', { headers: { Authorization: token } });
const body = await res.json();
```

Correct:

```ts
const user = await api.get('/users/1', UserSchema, {
  headers: { Authorization: token },
});
console.log(user.id);
```

`api.*` overloads are schema-based helpers; they return validated payloads, not a `Response`.

Source: zap-studio/monorepo:packages/fetch/src/index.ts

### HIGH Ignoring validation result branch

Wrong:

```ts
const user = await $fetch('/users/1', UserSchema, {
  throwOnValidationError: false,
});
console.log(user.id);
```

Correct:

```ts
const result = await $fetch('/users/1', UserSchema, {
  throwOnValidationError: false,
});

if (result.issues) throw new Error('Invalid payload');
console.log(result.value.id);
```

With `throwOnValidationError: false`, return type is `{ value?, issues? }` and must be narrowed.

Source: zap-studio/monorepo:packages/fetch/src/index.ts

### MEDIUM Relying on implicit body semantics for non-JSON inputs

Wrong:

```ts
await api.post('/users', UserSchema, {
  body: new URLSearchParams({ name: 'Ada' }),
});
```

Correct:

```ts
await api.post('/users', UserSchema, {
  body: { name: 'Ada' },
  headers: { 'Content-Type': 'application/json' },
});
```

Only plain object bodies are auto-JSON-stringified; other `BodyInit` forms keep their native encoding behavior.

Source: zap-studio/monorepo:packages/fetch/src/utils.ts

See also: zap-validation-standard-schema/SKILL.md — response validation result handling.
