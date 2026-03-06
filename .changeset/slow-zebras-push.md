---
"@zap-studio/webhooks": patch
---

Fix payload schema validation internals to use the current async `standardValidate` options API (`{ throwOnError: false }`), restoring typecheck compatibility after the validation helper signature update.
