"@zap-studio/fetch": patch
---

Fix request body handling for JSON payloads.

- Accept JSON values (including arrays) in `ExtendedRequestInit.body`
- Auto-stringify plain JSON body values regardless of whether a response schema is provided
- Set `Content-Type: application/json` only when auto-stringifying and no explicit content type is set
