from repositories.user_repository import UserRepository
from utils.jwt import create_access_token, get_password_hash, verify_password
from utils.structured_logging import get_logger
from fastapi import HTTPException

logger = get_logger(__name__)


class AuthService:
    """Authentication via JSON user repository — swappable with DB later."""

    def __init__(self):
        self.users = UserRepository()

    def register(self, email: str, full_name: str, password: str):
        try:
            user = self.users.create(email, full_name, get_password_hash(password))
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        token = create_access_token({"sub": str(user.id), "email": user.email})
        return user, token

    def authenticate(self, email: str, password: str):
        user = self.users.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_access_token({"sub": str(user.id), "email": user.email})
        return user, token

    def get_user(self, user_id: int):
        user = self.users.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
