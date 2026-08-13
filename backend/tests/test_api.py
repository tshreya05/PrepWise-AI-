import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("USERS_JSON_PATH", str(tmp_path / "users.json"))
    monkeypatch.setenv("OPENAI_API_KEY", "test-key-for-import")
    from config import get_settings
    get_settings.cache_clear()
    from main import app
    return TestClient(app)


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register_and_login(client):
    reg = client.post("/register", json={
        "email": "user@test.com",
        "full_name": "Test User",
        "password": "password123",
    })
    assert reg.status_code == 200
    assert "access_token" in reg.json()

    login = client.post("/login", json={
        "email": "user@test.com",
        "password": "password123",
    })
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "user@test.com"
