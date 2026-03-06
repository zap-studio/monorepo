---
"@zap-studio/validation": minor
---

Add `createStandardValidator` for reusable async validation and `standardValidateSync` for synchronous validation.

Rework `standardValidate` to accept an options object (`{ throwOnError }`) instead of a boolean argument while preserving typed throwing/non-throwing return behavior.
