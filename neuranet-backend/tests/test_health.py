def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "Running"


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert "collector_running" in body


def test_ai_test(client):
    response = client.get("/ai/test")
    assert response.status_code == 200
    assert response.json()["status"] == "AI Loaded"


def test_protected_route_requires_auth(client):
    # No Authorization header -> should be rejected, not silently allowed.
    response = client.get("/devices")
    assert response.status_code in (401, 403)
