# Security Policy

## Supported versions

Zap Studio packages follow semantic versioning. Security fixes are provided for
the latest published release line of each package.

| Version                   | Supported     |
| ------------------------- | ------------- |
| Latest release line       | Supported     |
| Older release lines       | Not supported |
| Unreleased work on `main` | Best effort   |

If you rely on Zap Studio in production, stay current with the latest package releases.

## Reporting a vulnerability

Please report vulnerabilities privately. Do not open a public issue,
discussion, or pull request.

Preferred reporting path:

1. GitHub Security Advisories / private vulnerability reporting, if available in the repository Security tab

Please include:

- affected package or scope
- affected version(s)
- clear reproduction steps
- impact and severity, if known
- any mitigation or fix ideas, if available

If you already have a patch or proof of concept, include it privately with the
report.

## Scope

This policy applies to:

- `@zap-studio/fetch`
- `@zap-studio/permit`
- `@zap-studio/validation`
- `@zap-studio/webhooks`
- the documentation and repository-maintained tooling in this monorepo

This policy does not cover:

- third-party dependencies themselves
- applications built by downstream users with these packages

## Response

We will review reports as promptly as practical, confirm whether the issue is
in scope, and coordinate a fix and disclosure process when needed.
