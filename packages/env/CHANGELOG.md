# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

### Added

- First release of `@zap-studio/env`.
- `createEnvironment(...)`, with a `server`/`client`/`shared` split. `clientPrefix` checks client keys. `runtimeEnvironment`/`runtimeEnvironmentStrict` set the env object to check. Other options: `isServer`, `skipValidation`, `emptyStringAsUndefined`, `onValidationError`, and `onInvalidAccess`.
- `extends`, to reuse a schema from another package. If two sources use the same key with different schemas, `createEnvironment` throws.
- Presets for common hosting platforms: `vercel`, `netlify`, `render`, `railway`, `fly`, `coolify`, `cloudflare`, `denoDeploy`.
- `generateEnvironmentExample(...)`, which builds a `.env.example` file from a schema.
- Three error types: `EnvironmentError` for bad setup, `EnvironmentValidationError` for failed checks, and `EnvironmentAccessError` for reading a server-only key from client code.
- Optional OpenTelemetry support through an `env.validate` span.
- Support for any [Standard Schema](https://standardschema.dev) library, such as Zod, Valibot, or ArkType.
