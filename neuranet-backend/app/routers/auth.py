from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database.database import get_db
from app.models.user import User

from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
)

from app.auth.auth import (
    create_user,
    authenticate_user,
)

from app.auth.token import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

# Separate limiter instance keyed the same way as the app-level one in
# main.py. slowapi reads the limiter off `request.app.state.limiter` at
# call time, so this decorator works against the shared limiter without
# a circular import back to main.py.
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(User)
        .filter(
            (User.username == user.username) | (User.email == user.email)
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered",
        )

    return create_user(db, user)


@router.post("/login")
@limiter.limit("5/minute")
def login(
    request: Request,
    user: UserLogin,
    db: Session = Depends(get_db),
):

    db_user = authenticate_user(
        db,
        user.username,
        user.password,
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    token = create_access_token(
        {
            "sub": db_user.username,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }