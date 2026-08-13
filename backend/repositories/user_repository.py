from datetime import datetime, timezone
from typing import Optional

from config import get_settings
from models.user import User
from repositories.json_store import JsonStore
from utils.structured_logging import get_logger

logger = get_logger(__name__)


class UserRepository:
    """JSON-backed user repository. Swappable with a DB implementation later."""

    def __init__(self):
        settings = get_settings()
        self._store = JsonStore(settings.users_json_path)

    def _serialize(self, user: User) -> dict:
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "hashed_password": user.hashed_password,
            "created_at": user.created_at.isoformat(),
        }

    def _deserialize(self, data: dict) -> User:
        created = data.get("created_at")
        if isinstance(created, str):
            created = datetime.fromisoformat(created.replace("Z", "+00:00"))
        else:
            created = datetime.now(timezone.utc)
        return User(
            id=int(data["id"]),
            email=data["email"],
            full_name=data["full_name"],
            hashed_password=data["hashed_password"],
            created_at=created,
        )

    def _next_id(self, records: list[dict]) -> int:
        if not records:
            return 1
        return max(int(r["id"]) for r in records) + 1

    def create(self, email: str, full_name: str, hashed_password: str) -> User:
        records = self._store.read_all()
        if any(r["email"].lower() == email.lower() for r in records):
            raise ValueError("Email already registered")
        user = User(
            id=self._next_id(records),
            email=email.lower(),
            full_name=full_name,
            hashed_password=hashed_password,
        )
        records.append(self._serialize(user))
        self._store.write_all(records)
        logger.info("user_created", extra={"user_id": user.id, "email": user.email})
        return user

    def get_by_id(self, user_id: int) -> Optional[User]:
        for record in self._store.read_all():
            if int(record["id"]) == user_id:
                return self._deserialize(record)
        return None

    def get_by_email(self, email: str) -> Optional[User]:
        email_lower = email.lower()
        for record in self._store.read_all():
            if record["email"].lower() == email_lower:
                return self._deserialize(record)
        return None

    def list_all(self) -> list[User]:
        return [self._deserialize(r) for r in self._store.read_all()]
