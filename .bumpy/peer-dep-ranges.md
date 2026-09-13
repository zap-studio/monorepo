---
"@zap-studio/fetch": patch
"@zap-studio/permit": patch
"@zap-studio/retry": patch
"@zap-studio/webhooks": patch
"@zap-studio/store-react": patch
"@zap-studio/webmcp-react": patch
---

Widen internal peer dependency ranges from an exact pin to a caret range, so consumers no longer resolve a duplicate copy of the peer on version skew.
