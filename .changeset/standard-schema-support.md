---
"@zap-studio/fetch": minor
---

### Standard Schema Support

Migrated from Zod-only validation to **Standard Schema v1** specification, enabling support for multiple validation libraries:
- Zod
- Valibot
- ArkType
- Any Standard Schema compliant library

### New Features

- **Factory Pattern**: `createFetch()` for creating pre-configured fetch instances with `baseURL`, default `headers`, and error handling options
- **Smart URL Handling**: Absolute URLs bypass `baseURL` configuration
- **Auto JSON Body**: Automatic `JSON.stringify()` and `Content-Type` header when using schemas with request bodies

### Breaking Changes

- Schema validation now requires Standard Schema compliant libraries (Zod 3.23+, Valibot 1.0+, ArkType 2.0+)
- Internal file structure reorganized (affects deep imports if any were used)
- `FetchError` constructor signature changed: now requires `(message, response)`

### Migration Guide

```typescript
// Before (Zod-only)
import { $fetch } from "@zap-studio/fetch";
import { z } from "zod";

// After (Standard Schema - works the same with Zod!)
import { $fetch } from "@zap-studio/fetch";
import { z } from "zod"; // Zod 3.23+ is Standard Schema compliant

// Or use other libraries
import * as v from "valibot";
import { type } from "arktype";
```
