"""
Shared pytest fixtures.

Sets required environment variables *before* any `app` module is imported,
since app/database/database.py and app/auth/token.py read them at import
time and raise if they're missing. Uses a throwaway SQLite file per test
session so tests never touch a developer's real neuranet.db.
"""
import os
import tempfile

import pytest

# --- Required env vars must exist before "app" is imported anywhere ---
_TMP_DB = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_TMP_DB.name}")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-not-for-production")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")
os.environ.setdefault("DISABLE_COLLECTOR_AUTOSTART", "true")


@pytest.fixture(scope="session")
def client():
    """
    FastAPI TestClient bound to the app.

    Imported lazily inside the fixture (not at module scope) so the env
    vars above are guaranteed to be set first.
    """
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def new_user():
    """A unique-ish user payload for register/login tests."""
    import uuid

    suffix = uuid.uuid4().hex[:8]
    return {
        "username": f"testuser_{suffix}",
        "email": f"testuser_{suffix}@example.com",
        "password": "S3curePassw0rd!",
    }
