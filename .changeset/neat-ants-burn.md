---
"@zap-studio/validation": patch
---

Refactor reusable validators to delegate to `standardValidate`/`standardValidateSync` and add per-call options support.

- `createStandardValidator` now supports `throwOnError` with the same return-type behavior as `standardValidate`.
- `createSyncStandardValidator` now supports `throwOnError` with the same return-type behavior as `standardValidateSync`.
- Updated docs and examples for reusable validator option handling.
