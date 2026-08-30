---
name: review-linting
description: Use when an oxlint finding needs a fix or a disable comment, when adding a `// oxlint-disable` or `v8 ignore` comment, or when writing a runtime `as` type cast that needs a SAFETY comment.
---

# Review linting

## Working through an oxlint finding

1. Stop on the finding. Do not silence it before you understand it.
2. Read what the rule checks. oxlint messages often link to docs. If not, search the rule name online.
3. Assume the code is wrong first. Check it for the thing the rule flags — most findings mean the code needs a fix. Make it.
4. Only if the finding still looks wrong after that, consider that the rule lacks context about this code. This is rare. It means the rule cannot see why the code is correct here — not that the fix is inconvenient or the rule feels too strict.

## When a disable comment is the right call

Only step 4: a rule that cannot see something true about this specific code. For example:

- The rule wants an API the code cannot use here (an observer that does not exist for this target, a schema for validating a value that has none).
- A hook's dependency array is a pass-through from the caller, so the rule cannot check it.
- The exact thing the rule warns about is the feature itself, asked for on purpose by the caller.
- A `v8 ignore` for a code path a test cannot reach on purpose (an old runtime version, a real production build, a type-safety guard that can never actually trigger).

Format: `// oxlint-disable-next-line <rule> -- <reason>` (or `oxlint-disable` / `oxlint-disable-file` for a wider scope, `v8 ignore next` / `v8 ignore next N` for coverage). The reason: clear, very short, B1 English, why the rule does not fit here — never what the rule or the code does.

`react-doctor/*` findings are normal oxlint findings — `react-doctor` is an oxlint plugin, not a separate tool. Use the same `oxlint-disable-next-line` comment.

## SAFETY comments for `as` casts

Every non-const `as` cast needs a `// SAFETY: ...` comment stating the invariant behind it. This is enforced everywhere, including tests, by a lint rule. Test code and runtime code differ in how hard you should try to avoid the cast, not in whether the comment is required.

- **In tests**, casting a partial object to a full type is normal — a test double only needs the properties the test uses. Say that, or point at the check that already proved the type.
- **In runtime code**, be stricter. A cast is a deliberate handoff of responsibility to the caller. Prefer a schema check over a cast when the API can validate at runtime. Only cast when there is no schema and the caller owns the shape by contract — and say exactly what guarantees that.
