# Security Policy

NeuraNet is a portfolio/learning project, but it implements real
authentication, and network-security tooling attracts real scrutiny — so
it's held to a real disclosure process.

## Supported Versions

NeuraNet does not yet have tagged releases. Security fixes are applied to
the `main` branch only.

| Version | Supported |
|---|---|
| `main`  | Supported |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead:

1. Use GitHub's [private vulnerability reporting](../../security/advisories/new)
   for this repository (Security → Advisories → "Report a vulnerability"), **or**
2. Email the maintainer directly (see [Contact](README.md#contact) in the
   README) with:
   - A description of the vulnerability and its potential impact
   - Steps to reproduce, or a proof-of-concept if available
   - Any suggested remediation, if you have one

You should receive an acknowledgement within a few days. This is a solo
project without an SLA, but reports are taken seriously and fixed as
promptly as possible; you'll be credited in the fix's changelog entry
unless you'd prefer to stay anonymous.

## Scope

In scope:
- The `neuranet-backend` FastAPI application (auth, routers, AI inference
  endpoints, database layer)
- The `neuranet-frontend` React SPA
- The Docker/Compose configuration

Out of scope:
- Vulnerabilities in third-party dependencies upstream of this project
  (report those to the dependency's own maintainers — feel free to also
  flag them here if NeuraNet's usage makes them exploitable)
- The trained ML model's classification accuracy — that's a model-quality
  issue, not a security vulnerability, and should be filed as a regular
  issue instead

## Known, Accepted Risks (by design, for this deployment scope)

Documented here rather than left implicit, so a report doesn't need to be
filed for these — they're already tracked in the
[Roadmap](README.md#roadmap):

- **JWTs are not revocable** — there is no refresh-token rotation or
  server-side blocklist yet. A leaked token remains valid until it expires
  (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- **No role-based access control** — every authenticated user has the same
  permissions. NeuraNet is built for single-analyst/single-tenant use.
- **Live packet capture requires elevated privileges** — running the
  collector against real traffic needs `NET_ADMIN`/`NET_RAW` (or
  equivalent), which is a meaningful privilege to grant a container. Do
  not run the collector with those capabilities on a host you don't trust.

## Current Security Measures

- Passwords are hashed with bcrypt (via passlib); plaintext passwords are
  never logged, stored, or returned in any API response.
- `/auth/login` is rate-limited (5 requests/minute/IP via `slowapi`) to
  slow down credential-stuffing attempts.
- All routes except `/auth/*` require a valid JWT bearer token
  (`app/auth/dependencies.py`).
- CORS is explicitly allow-listed via `CORS_ORIGINS`, not wildcarded.
- Configuration (JWT secret, database URL, allowed origins) is supplied
  entirely through environment variables — no secrets are committed to
  source control, and the app refuses to start without `JWT_SECRET_KEY`
  set.
- Dependencies are updated via automated pull requests
  (see `.github/dependabot.yml`).
