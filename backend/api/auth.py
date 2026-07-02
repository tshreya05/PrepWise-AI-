from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_current_user
from database.db import get_db
from database.models import User
from schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse
from services.app_services import AuthService
from utils.jwt import create_access_token

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.register(data.email, data.full_name, data.password)
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: Session = Depends(get_db)):
    service = AuthService(db)
    user, token = service.authenticate(data.email, data.password)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
