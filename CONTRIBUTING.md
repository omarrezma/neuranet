# Contributing to NeuraNet

Thanks for considering a contribution. NeuraNet started as a solo
portfolio project, but it's built and tested the way a shared codebase
should be, so external contributions are welcome.

## Before you start

- For anything beyond a small fix (typo, docs, obvious bug), please open
  an issue first to discuss the change. This avoids wasted work on a pull
  request that doesn't fit the project's direction.
- For security issues, do **not** open a public issue — see
  [SECURITY.md](SECURITY.md) instead.

## Development setup

```bash
git clone https://github.com/omarrezma/neuranet.git
cd neuranet

# Backend
cd neuranet-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set a real JWT_SECRET_KEY
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd neuranet-frontend
npm install
cp .env.example .env
npm start
```

See the main [README](README.md#installation) for the full setup guide,
including Docker Compose.

## Making changes

1. Fork the repository and create a branch off `main`:
   `git checkout -b fix/short-description`
2. Make your change. Keep pull requests focused — one logical change per
   PR is much easier to review than a mixed bag.
3. Add or update tests. New backend logic should have a `pytest` case in
   `neuranet-backend/tests/`; new frontend components should have a
   Vitest/Testing Library case alongside them.
4. Run the full test suite locally before opening a PR:
   ```bash
   cd neuranet-backend && pytest
   cd neuranet-frontend && npm run lint && npm test && npm run build
   ```
5. Update documentation if your change affects setup, configuration, or
   the public API (README, `.env.example`, `docs/`).
6. Add an entry to [CHANGELOG.md](CHANGELOG.md) under an "Unreleased"
   heading.

## Code style

- **Backend (Python):** follow the existing style in `app/` — type-annotated
  function signatures, `app.logging_config.get_logger(__name__)` instead of
  `print()`, and no secrets or credentials in source. There's no linter
  wired into CI yet for Python; please keep new code close to
  [PEP 8](https://peps.python.org/pep-0008/).
- **Frontend (JavaScript/JSX):** run `npm run lint` before committing —
  this project uses ESLint + Prettier, configured in `eslint.config.mjs`.

## Commit messages

Use short, descriptive, imperative-mood messages (`Fix rate limit on
login`, not `fixed bug`). Reference the related issue number if one
exists (`Fixes #12`).

## Pull requests

- Fill out the PR template — it asks for what changed, why, and how it
  was tested.
- CI (`.github/workflows/ci.yml`) must pass: backend `pytest`, frontend
  `vitest` + build.
- A maintainer will review and may request changes. Please be patient —
  this is a side project maintained outside of full-time work.

## Reporting bugs / requesting features

Use the issue templates under `.github/ISSUE_TEMPLATE/` — they collect
the information needed to reproduce a bug or evaluate a feature request
without a back-and-forth.

## Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By
participating, you're expected to uphold it.
