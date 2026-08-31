# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

### Added

- First release. `createStore(initialState, actionsFactory?, options?)` returns `.get()` (state and actions together), `.getState()` (state only), and `.subscribe(listener)` (returns a plain unsubscribe function). `.get()` returns the same reference across calls until the state actually changes.
- `set` only takes an updater function: `set((prev) => partialOrFullState)`. The result is always shallow-merged into the state. Actions are created once, when the store is created, via `actionsFactory`.
- `derive(deps, fn)`: an auto-tracked, cached derived value. It recomputes based on what `fn` actually reads during the last run, not based on the `deps` array you wrote. `deps` only controls the order and the types of the arguments.
- Simple built-in persist, via `createStore(initialState, actionsFactory?, { persist: { key, storage } })`. `storage` only needs `getItem`, `setItem`, and `removeItem`, so `localStorage` and `sessionStorage` work with no extra code. There is no version or migration system yet. Only plain state is saved — actions are never saved.
