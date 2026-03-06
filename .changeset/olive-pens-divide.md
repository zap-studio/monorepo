---
"@zap-studio/permit": major
---

Make policy evaluation async by default.

`policy.can(...)` now returns a `Promise<boolean>` and must be awaited.

`createPolicy` now uses async-safe Standard Schema validation internally, so resource schemas with async validation are supported.

`mergePolicies` and `mergePoliciesAny` are also async through the shared `Policy` interface.
