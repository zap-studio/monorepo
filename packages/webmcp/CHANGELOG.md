# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1]

### Fixed

- Removed the `declare global` augmentation of `Document.modelContext` — JSR's public API analysis (`slow-types`) rejects global module augmentations outright, which blocked `jsr publish` entirely. Replaced with an exported `WebMCPDocument` type (`Document & { modelContext?: ModelContext }`); cast through it — `document as WebMCPDocument` — at any call site that needs `modelContext` directly. The npm 1.0.0 release predates this fix and still carries the ambient global version, which works fine for npm/TypeScript consumers; only JSR publishing was affected.

## [1.0.0]

### Added

- First release. `defineTool(tool)` validates a tool's `name` (1-128 characters, letters/digits/`_`/`-`/`.`) and non-empty `description`, then returns it unchanged.
- `registerTool(tool, options?)` wraps `document.modelContext.registerTool`: resolves to a no-op unregister function during server rendering, rejects with `WebMCPNotSupportedError` in browsers without WebMCP support, and otherwise returns a single idempotent unregister function backed by an internal `AbortSignal` (combined with `options.signal` when provided).
- `hasWebMCPSupport()` reports whether `document.modelContext` is available in the current environment.
- `createToolRegistry()` batches a group of tools behind one `.add()`/`.mount()`/`.unmount()`/`.list()` API, so a route's tools mount and unmount together. `unmount()` is idempotent and safe pre-mount.
- `WebMCPNotSupportedError`, thrown by `registerTool` when the current browser doesn't expose `document.modelContext`.
