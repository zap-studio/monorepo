# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

### Added

- First release. `useStore(store)` subscribes a component to a `createStore`/`derive` instance and re-renders on every change.
- `useStore(store, selector)` narrows the subscribed value; the component only re-renders when the selected result changes, compared with `Object.is`.
- Built on React's `useSyncExternalStore`, so subscriptions are safe under concurrent rendering.
