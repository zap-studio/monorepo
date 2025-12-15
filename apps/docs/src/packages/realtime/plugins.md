# Plugins

Pre-built event schemas and helpers for common real-time features.

## Chat Plugin

A complete chat system with messages, presence, and typing indicators.

This is not ready yet, we're working to improve the API for a better developer experience.

## Notifications Plugin

A notification system with priorities and read/dismiss tracking.

This is also not ready yet.

## Creating Custom Plugins

You can create your own plugins following the same pattern:

```typescript
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Events } from "@zap-studio/realtime/server";

// Define event types
export type MyEventDefinitions = {
  myEvent: StandardSchemaV1<{ id: string; data: string }>;
};

// Create schema factory
export function createMyEventsSchema<
  TString extends StandardSchemaV1<string>,
>(schemaBuilder: {
  object: <T extends Record<string, StandardSchemaV1>>(shape: T) => StandardSchemaV1<...>;
  string: () => TString;
}): MyEventDefinitions {
  return {
    myEvent: schemaBuilder.object({
      id: schemaBuilder.string(),
      data: schemaBuilder.string(),
    }),
  };
}

// Create plugin helpers
export function createMyPlugin(events: Events<MyEventDefinitions>) {
  return {
    async sendMyEvent(data: { id: string; data: string }) {
      await events.publish("myEvent", data);
    },
  };
}
```
