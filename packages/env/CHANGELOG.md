# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

### Added

- Initial release of `@zap-studio/env`.
  - `createEnv(...)` with the `server`/`client`/`shared` split, `clientPrefix` enforcement, `runtimeEnv`/`runtimeEnvStrict`, `isServer`, `skipValidation`, `emptyStringAsUndefined`, and `onValidationError`/`onInvalidAccess` callbacks.
  - Schema-level `extends` composition with reference-equality conflict detection.
  - Platform presets: `vercel`, `netlify`, `render`, `railway`, `fly`, `coolify`, `cloudflare`, `denoDeploy`.
  - `generateEnvExample(...)` for schema-driven `.env.example` generation.
  - `EnvError` for validation and configuration failures.
  - Native OpenTelemetry support via an optional `env.validate` span.
  - Standard Schema support (Zod, Valibot, ArkType, and more).
