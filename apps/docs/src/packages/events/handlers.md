# Handlers: on, once, off

## on

Subscribe to an event. Returns an unsubscribe function.

```ts
const off = events.on("joined", ({ email }) => {
  console.log(email);
});
```

## once

Subscribe to an event and automatically remove the handler after the first call.

```ts
events.once("joined", ({ email }) => {
  console.log("first join", email);
});
```

## off

Remove a handler you previously registered.

```ts
const handler = ({ email }: { email: string }) => {
  console.log(email);
};

events.on("joined", handler);

events.off("joined", handler);
```
