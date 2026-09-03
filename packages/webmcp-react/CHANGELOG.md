# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

### Added

- First release. `useWebMCPTool(tool, deps?)` registers `tool` with `@zap-studio/webmcp`'s `registerTool` on mount, and unregisters it on unmount or when `deps` changes. `deps` defaults to `[]` and follows `useEffect`'s dependency-array semantics.
- Registration failures (most commonly an unsupported browser) are caught and surfaced through the hook's returned `error`, instead of being thrown.
- Guards against unmount-before-registration-resolves races: a tool that finishes registering after the component has already unmounted is unregistered immediately instead of leaking.
