import pytest
from repositories.user_repository import UserRepository
from utils.jwt import get_password_hash, verify_password


@pytest.fixture
def user_repo(tmp_path, monkeypatch):
    monkeypatch.setenv("USERS_JSON_PATH", str(tmp_path / "users.json"))
    from config import get_settings
    get_settings.cache_clear()
    return UserRepository()


def test_user_create_and_lookup(user_repo):
    user = user_repo.create("test@example.com", "Test User", get_password_hash("secret123"))
    assert user.id == 1
    assert user.email == "test@example.com"

    found = user_repo.get_by_email("test@example.com")
    assert found is not None
    assert found.full_name == "Test User"
    assert verify_password("secret123", found.hashed_password)


def test_duplicate_email_rejected(user_repo):
    user_repo.create("dup@example.com", "User One", get_password_hash("pass"))
    with pytest.raises(ValueError, match="already registered"):
        user_repo.create("dup@example.com", "User Two", get_password_hash("pass"))
