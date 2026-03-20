---
"@zap-studio/webhooks": minor
---

Switch `createHmacVerifier` to Web Crypto and make webhook request bytes portable across runtimes.

This change removes the Node `crypto` dependency from the verifier path, changes verifier secrets to portable Web Crypto-compatible inputs, and standardizes `req.rawBody` as `Uint8Array`.
