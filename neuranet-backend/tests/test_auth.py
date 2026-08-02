def test_register_new_user(client, new_user):
    response = client.post("/auth/register", json=new_user)
    assert response.status_code == 200
    body = response.json()

    # Password hash must never be exposed in the API response.
    assert "password" not in body
    assert "hashed_password" not in body
    assert body["username"] == new_user["username"]
    assert body["email"] == new_user["email"]


def test_register_duplicate_username_rejected(client, new_user):
    first = client.post("/auth/register", json=new_user)
    assert first.status_code == 200

    duplicate = client.post("/auth/register", json=new_user)
    assert duplicate.status_code == 400


def test_login_success_returns_token(client, new_user):
    client.post("/auth/register", json=new_user)

    response = client.post(
        "/auth/login",
        json={"username": new_user["username"], "password": new_user["password"]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_wrong_password_rejected(client, new_user):
    client.post("/auth/register", json=new_user)

    response = client.post(
        "/auth/login",
        json={"username": new_user["username"], "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_login_unknown_user_rejected(client):
    response = client.post(
        "/auth/login",
        json={"username": "does-not-exist", "password": "whatever"},
    )
    assert response.status_code == 401


def test_authenticated_route_accepts_valid_token(client, new_user):
    client.post("/auth/register", json=new_user)
    login = client.post(
        "/auth/login",
        json={"username": new_user["username"], "password": new_user["password"]},
    )
    token = login.json()["access_token"]

    response = client.get(
        "/devices",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
