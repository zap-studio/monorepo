---
"@zap-studio/env": patch
"@zap-studio/fetch": patch
"@zap-studio/permit": patch
"@zap-studio/webhooks": patch
---

Widen the internal `@zap-studio/validation` dependency range from an exact pin to a caret range, so consumers no longer resolve a duplicate copy on version skew.
