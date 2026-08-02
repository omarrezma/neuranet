from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.settings import Settings
from app.schemas.settings import SettingsResponse, SettingsUpdate

from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/settings",
    tags=["Settings"],
    dependencies=[Depends(get_current_user)],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(Settings).first()

    if not settings:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


@router.put("/", response_model=SettingsResponse)
def update_settings(
    data: SettingsUpdate,
    db: Session = Depends(get_db),
):
    settings = db.query(Settings).first()

    if not settings:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    for key, value in data.model_dump().items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return settings