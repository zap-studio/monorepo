# Schema Presets

Schema presets provide pre-configured schema builders for popular validation libraries, making it easy to use the realtime plugins without manual configuration.

## Overview

The realtime plugins (like chat and notifications) use a schema builder pattern that works with any Standard Schema compatible library. Presets eliminate the boilerplate of creating these builders manually.

## Available Presets

### Zod

```typescript
import { zodSchemaBuilder } from "@zap-studio/realtime/presets/zod";
import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";

const ChatEvents = createChatEventsSchema(zodSchemaBuilder);
```

### Valibot

```typescript
import { valibotSchemaBuilder } from "@zap-studio/realtime/presets/valibot";
import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";

const ChatEvents = createChatEventsSchema(valibotSchemaBuilder);
```

### ArkType

```typescript
import { arktypeSchemaBuilder } from "@zap-studio/realtime/presets/arktype";
import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";

const ChatEvents = createChatEventsSchema(arktypeSchemaBuilder);
```

### TypeBox

```typescript
import { typeboxSchemaBuilder } from "@zap-studio/realtime/presets/typebox";
import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";

const ChatEvents = createChatEventsSchema(typeboxSchemaBuilder);
```

## Using with Plugins

### Chat Plugin

```typescript
import { zodSchemaBuilder } from "@zap-studio/realtime/presets/zod";
import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";
import { Events } from "@zap-studio/realtime/server";
import { InMemoryEmitter } from "@zap-studio/realtime/emitters/in-memory";

// Create chat events with Zod validation
const ChatEvents = createChatEventsSchema(zodSchemaBuilder);

// Use in your events instance
const emitter = new InMemoryEmitter();
const events = new Events(ChatEvents, emitter);

// Now you have type-safe chat events!
```

### Notifications Plugin

```typescript
import { valibotSchemaBuilder } from "@zap-studio/realtime/presets/valibot";
import { createNotificationEventsSchema } from "@zap-studio/realtime/plugins/notifications";
import { Events } from "@zap-studio/realtime/server";
import { InMemoryEmitter } from "@zap-studio/realtime/emitters/in-memory";

// Create notification events with Valibot validation
const NotificationEvents = createNotificationEventsSchema(valibotSchemaBuilder);

const emitter = new InMemoryEmitter();
const events = new Events(NotificationEvents, emitter);
```

## Schema Builder API

Each preset provides the following methods:

| Method | Description |
|--------|-------------|
| `object(shape)` | Create an object schema |
| `string()` | Create a string schema |
| `number()` | Create a number schema |
| `boolean()` | Create a boolean schema |
| `enum(values)` | Create an enum/literal union schema |
| `optional(schema)` | Make a schema optional |
| `record(schema)` | Create a record/dictionary schema |
| `unknown()` | Create an unknown/any schema |
| `array(schema)` | Create an array schema |
| `nullable(schema)` | Make a schema nullable |
| `literal(value)` | Create a literal value schema |
| `union(schemas)` | Create a union of schemas |

You’re welcome to open an issue or submit a PR if additional methods are needed.

## Custom Schema Builder

If you use a different validation library, you can create your own schema builder:

```typescript
import type { StandardSchemaV1 } from "@standard-schema/spec";
import * as myValidator from "my-validator";

const mySchemaBuilder = {
  object: <T extends Record<string, StandardSchemaV1>>(shape: T) =>
    myValidator.object(shape) as StandardSchemaV1<...>,

  string: (): StandardSchemaV1<string> => myValidator.string(),

  number: (): StandardSchemaV1<number> => myValidator.number(),

  boolean: (): StandardSchemaV1<boolean> => myValidator.boolean(),

  enum: <T extends readonly [string, ...string[]]>(values: T) =>
    myValidator.oneOf(values),

  optional: <T extends StandardSchemaV1>(schema: T) =>
    myValidator.optional(schema),

  record: <T extends StandardSchemaV1>(schema: T) =>
    myValidator.record(schema),

  unknown: (): StandardSchemaV1<unknown> => myValidator.unknown(),
};

// Use with plugins
const ChatEvents = createChatEventsSchema(mySchemaBuilder);
```

## Why Use Presets?

### Without Presets (Manual Configuration)

```typescript
import { z } from "zod";
import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";

// Tedious manual configuration
const ChatEvents = createChatEventsSchema({
  object: z.object,
  string: () => z.string(),
  number: () => z.number(),
  boolean: () => z.boolean(),
  enum: z.enum,
  optional: <T extends z.ZodType>(schema: T) => schema.optional(),
  record: <T extends z.ZodType>(schema: T) => z.record(z.string(), schema),
  unknown: () => z.unknown(),
});
```

### With Presets

```typescript
import { zodSchemaBuilder } from "@zap-studio/realtime/presets/zod";
import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";

// Simple one-liner!
const ChatEvents = createChatEventsSchema(zodSchemaBuilder);
```

## Installation Requirements

Each preset requires its corresponding validation library as a peer dependency:

```bash
# For Zod
pnpm add zod

# For Valibot
pnpm add valibot

# For ArkType
pnpm add arktype

# For TypeBox
pnpm add @sinclair/typebox
```
