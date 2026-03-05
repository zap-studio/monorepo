---
"@zap-studio/webhooks": minor
---

Initial public release of `@zap-studio/webhooks`.

- Introduces a schema-first webhook router with inferred payload types.
- Adds request verification support, including `createHmacVerifier`.
- Provides lifecycle hooks (`before`, `after`, `onError`) for cross-cutting concerns.
- Exposes framework-agnostic adapter contracts via `Adapter` and `BaseAdapter`.
- Includes comprehensive test coverage and documentation.
