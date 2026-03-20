---
"@zap-studio/webhooks": minor
---

Switch `createHmacVerifier` to Web Crypto and standardize the verifier around string secrets.

This change removes the Node `crypto` dependency from the verifier path, keeps `req.rawBody` as `Uint8Array`, and simplifies `createHmacVerifier` to take a string secret.
