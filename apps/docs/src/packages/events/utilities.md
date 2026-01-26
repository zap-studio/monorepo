# Utilities

## clear

Remove handlers for a specific event or for all events.

```ts
events.clear("joined");

// Remove all handlers
events.clear();
```

## listenerCount

Get the number of handlers registered for an event.

```ts
const count = events.listenerCount("joined");
```
