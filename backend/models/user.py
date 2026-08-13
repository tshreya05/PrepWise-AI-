from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class User:
    """Domain model for authenticated users (stored in JSON, not ORM)."""
    id: int
    email: str
    full_name: str
    hashed_password: str
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_public_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "created_at": self.created_at,
        }
