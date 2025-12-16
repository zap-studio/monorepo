# @zap-studio/permit

## 0.1.1

### Patch Changes

- 907d903: Add runtime resource validation and fail-closed behavior, including denying access when merges are called with no policies.

## 0.1.0

### Minor Changes

- 0627885: Initial release of @zap-studio/permit - a type-safe, declarative authorization library for TypeScript.

  Features:

  - Declarative policy creation with `createPolicy()`
  - Policy rules: `allow()`, `deny()`, and `when()` for conditional access
  - Condition combinators: `and()`, `or()`, `not()`, and `has()`
  - Role-based access control with `hasRole()` and role hierarchies
  - Policy merging with `mergePolicies()` (deny-overrides) and `mergePoliciesAny()` (allow-overrides)
  - Standard Schema support (Zod, Valibot, ArkType, etc.)
  - Full TypeScript support with type inference
  - `PolicyError` class for authorization errors
  - `assertNever()` helper for exhaustive type checking
