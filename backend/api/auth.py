from fastapi import APIRouter, Depends

from schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from services.auth_service import AuthService
from api.deps import get_current_user
from models.user import User

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister):
    service = AuthService()
    user, token = service.register(data.email, data.full_name, data.password)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    service = AuthService()
    user, token = service.authenticate(data.email, data.password)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
    )
