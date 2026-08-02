# CHANGELOG — NeuraNet Review & Refactor

## Pass 3 — repository/portfolio transformation

- **Normalized line endings.** 52 backend `.py` files and 5 frontend
  `.js`/`.jsx` files were saved with CRLF (Windows) line endings while the
  rest of the codebase used LF, which produces noisy whole-file diffs on
  Linux/macOS checkouts and git-blame churn. Converted to LF; `.gitattributes`
  (`* text=auto eol=lf`) now keeps this consistent going forward.
- **Added real screenshots.** `docs/screenshots/` now contains actual
  application screenshots (dashboard, alerts, analytics, devices,
  incidents, login, AI analysis, landing page) replacing the numbered
  placeholder paths the README previously pointed at.
- **Added `docs/architecture/README.md`** — a detailed data-flow diagram
  and component-boundary rationale (capture → feature extraction →
  inference → alerting → reasoning → API → dashboard), separate from the
  high-level tree in the main README.
- **Added standard open-source project files:** `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1), `SECURITY.md`
  (private vulnerability disclosure process, scope, and documented
  accepted risks).
- **Added GitHub repository plumbing:** issue templates (bug report,
  feature request), a pull request template, `dependabot.yml`
  (pip/npm/GitHub Actions, weekly), and `labels.yml` documenting the
  intended label taxonomy.
- **Rewrote the top-level README** end-to-end with real screenshots
  embedded, an expanded folder structure section, and all setup
  instructions verified against the actual `Dockerfile`/`.env.example`
  files in the repo.

---

## Pass 2 — production hardening for public release

- **Replaced ~30 `print()` calls with structured logging.** New
  `app/logging_config.py`; applied across `main.py`, `ai/loader.py`,
  `collector/packet_capture.py`, and `collector/collector.py`. Level is
  configurable via `LOG_LEVEL`.
- **Fixed a real bcrypt/passlib incompatibility.** `passlib==1.7.4` reads
  `bcrypt.__about__.__version__`, which was removed in `bcrypt>=4.1`. This
  silently broke every password hash/verify call with
  `ValueError: password cannot be longer than 72 bytes` — even for short
  passwords. Caught by the new test suite; fixed by pinning `bcrypt<4.1` in
  `requirements.txt`.
- **Added rate limiting to `/auth/login`** (5 requests/minute per IP) via
  `slowapi`, to slow down credential-stuffing attempts.
- **Added a backend test suite** (`pytest` + `httpx`/`TestClient`):
  health endpoints, register/login flow, duplicate-user rejection, wrong
  password rejection, and protected-route auth enforcement.
- **Added a frontend test suite** (`vitest` + `@testing-library/react`),
  starting with `StatCard`. Also fixed the Vitest/esbuild config, which
  wasn't applying React's automatic JSX runtime under the test transform
  (`esbuild.jsx: 'automatic'` in `vite.config.mjs`) — every component test
  failed with `ReferenceError: React is not defined` until this was set.
- **Added Dockerfiles** for both services (backend: Python 3.12-slim +
  uvicorn; frontend: multi-stage Node build served via nginx) plus a
  root `docker-compose.yml` to run both together.
- **Added a GitHub Actions CI workflow** (`.github/workflows/ci.yml`) that
  runs the backend test suite and the frontend test suite + build on every
  push/PR.
- **Rewrote the top-level README** with real setup, Docker, testing, and
  configuration docs; replaced the frontend's stock CoreUI template README
  with a short pointer to it.

---

Scope note: this pass focused on **security bugs, structural/dead-code cleanup,
broken files, and missing production essentials**. It preserves 100% of the
original application features and did not rewrite the CoreUI-generated view
components that are actually in use — see "Remaining recommendations" for what's
still worth doing.

---

## Backend (`neuranet-backend/app`, originally `bxkend.zip`'s companion — actual FastAPI code was in `app.zip`)

### Security fixes (highest priority)
- **Removed plaintext password logging.** `auth/hashing.py` and `auth/auth.py`
  were printing raw passwords and password metadata to stdout on every
  register call. Deleted.
- **Removed hardcoded JWT secret.** `auth/token.py` had
  `SECRET_KEY = "neuranet-secret-key"` committed in source. Now read from
  `JWT_SECRET_KEY` env var; the app refuses to start without it.
- **Fixed password hash leak on `/auth/register`.** The endpoint returned the
  raw SQLAlchemy `User` object with no `response_model`, which serialized
  `hashed_password` straight into the API response. Added `UserResponse`
  model and a duplicate username/email check.
- **Added authentication to 8 previously open routers.** `alerts`,
  `analytics`, `collector`, `dashboard`, `incident`, `settings`, `system`,
  and `ai` had no `get_current_user` dependency at all — anyone could hit
  them without a token. Added router-level
  `dependencies=[Depends(get_current_user)]` to all of them (`device` and
  `maintenance` were already protected).
- **CORS origins hardcoded** to `localhost:3000` only. Now configurable via
  `CORS_ORIGINS` env var (comma-separated).
- **`DATABASE_URL` had no validation** — a missing value failed later with a
  confusing SQLAlchemy error. Now raises a clear `RuntimeError` at startup.

### Bugs fixed
- Two **syntax errors** (missing trailing commas after `tags=[...]`) that
  I introduced while adding the auth dependency were caught and fixed;
  all 70 backend `.py` files now pass `python -m py_compile`.

### Files deleted
- `auth/New folder`, `collector/New folder`, `templates/New folder` — empty
  stray Windows Explorer folders.
- `static/style.css.txt`, `static/script.js.txt`, `static/script.groovy` —
  duplicate/orphaned static assets not referenced anywhere.
- All `__pycache__/` directories.

### Files renamed
- `database/__innit__.py` → `database/__init__.py`
- `collector/__innit__.py` → `collector/__init__.py`
- `routers/__innit__.py` → `routers/__init__.py`
  (typo'd package markers — worked by accident under Python 3 implicit
  namespace packages, but inconsistent with the correctly-named
  `__init__.py` files elsewhere in the same codebase and a real risk if the
  project is ever packaged/frozen.)

### Files added
- `requirements.txt` — did not exist. Built from actual imports found in the
  codebase (fastapi, uvicorn, sqlalchemy, python-dotenv, python-jose,
  passlib[bcrypt], pydantic[email], psutil, pandas, numpy, joblib, scapy,
  tensorflow, jinja2, python-multipart).
- `.env.example` — documents `DATABASE_URL`, `JWT_SECRET_KEY`,
  `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `CORS_ORIGINS`,
  `COLLECTOR_INTERFACE`.
- `.gitignore`.

---

## Frontend (`neuranet-frontend`, originally `bxkend.zip`)

### Dead code deleted (confirmed via grep across every route/import — nothing referenced these)
- `views/base/`, `views/buttons/`, `views/charts/`, `views/forms/`,
  `views/icons/`, `views/notifications/`, `views/theme/`, `views/widgets/`
  — ~720KB of unused CoreUI template demo pages, never wired into
  `routes.js`, `App.jsx`, or `_nav.jsx`.
- `components/DocsComponents.jsx`, `DocsExample.jsx`, `DocsIcons.jsx`,
  `DocsLink.jsx` — only used by the deleted demo pages above.
- `scss/examples.scss` — only styled the deleted demo pages; its `App.jsx`
  import was removed too.
- `views/dashboard/MainChart.jsx` — defined and exported but never imported
  by `Dashboard.jsx` or anywhere else. Dead.
- `api/ai.js` — 0-byte empty file, unused.
- `src.zip`, `public.zip` — redundant nested archives of the same `src/` and
  `public/` folders that shouldn't have been committed alongside the actual
  directories.
- Empty placeholder directories: `hooks/`, `services/`, `utils/`.

### Bugs fixed
- `api/axios.js` had a **hardcoded `baseURL: "http://127.0.0.1:8000"`**,
  meaning the frontend could never point at a staging/production API without
  editing source. Now reads `VITE_API_URL` via Vite's `import.meta.env`,
  falling back to localhost for local dev.

### Dependencies removed (confirmed zero usage after dead-code deletion)
- `@coreui/chartjs`, `@coreui/react-chartjs`, `@coreui/utils`, `chart.js` —
  only consumed by the now-deleted `MainChart.jsx`. The real chart on the
  dashboard (`AttackTrendChart.jsx`) is hand-rolled SVG and never used
  these.
- `classnames` — zero imports anywhere in the codebase.
- `framer-motion` — zero imports anywhere in the codebase (this one is a
  meaningful bundle-size win; it's a large library).
- Removed the matching `@use "@coreui/chartjs/scss/coreui-chartjs";` line
  from `scss/style.scss`.

### Files added
- `.env.example` — documents `VITE_API_URL`.
- `.gitignore`.

---

## Dependencies kept intentionally (verified as used, not obvious from a plain grep)
- `@popperjs/core` — peer dependency required by CoreUI's dropdown/popover/
  tooltip JS; not directly imported by app code, which is expected.
- `core-js` — imported once in `index.jsx` as a polyfill entry point.
- `@coreui/coreui` — consumed via `@use` in `scss/style.scss`, not JS.

---

## Post-delivery fixes (found during live testing, added after initial handoff)

- **`scikit-learn` was missing from `requirements.txt`.** No `.py` file
  directly imports it, so the original import-scan missed it — but
  `joblib.load()` needs it installed at runtime to unpickle the saved model
  scaler in `ai/loader.py`. Without it: `ModuleNotFoundError: No module
  named 'sklearn'`. Added to `requirements.txt`.
- **`/api/attack-trend` crashed on SQLite.** `routers/dashboard.py` used
  `func.date_trunc("hour", Alert.timestamp)`, which is a **PostgreSQL-only**
  SQL function. Since `.env.example` defaults `DATABASE_URL` to SQLite for
  local dev, every call to this endpoint failed with
  `sqlite3.OperationalError: no such function: date_trunc`. Rewrote the
  endpoint to group alerts by hour in Python instead of relying on a
  database-specific SQL function — now works identically on SQLite or
  PostgreSQL.

---

## Remaining recommendations (not done in this pass — flagged for follow-up)

1. ~~Replace `print()` debugging with the `logging` module~~ — **done in
   Pass 2**, see top of this file.
2. ~~No automated tests exist on either side~~ — **done in Pass 2**
   (`pytest` for the backend, `vitest` for the frontend).
3. ~~No Dockerfile / docker-compose / CI pipeline~~ — **done in Pass 2**.
4. ~~No rate limiting on `/auth/login`~~ — **done in Pass 2** (`slowapi`,
   5/minute).
5. **JWT tokens are not revocable** (no blocklist/refresh-token rotation) —
   acceptable for an MVP, worth revisiting before scaling.
6. **`ai/models/`** (~1MB of binary model files) is committed directly to
   source control — consider a model registry or release-asset strategy
   instead of storing binaries in the app repo.
7. Full component-by-component performance/re-render audit of the
   `views/dashboard`, `views/devices`, etc. pages was out of scope for this
   pass — worth a follow-up if load testing surfaces real bottlenecks.

