from fastapi import APIRouter, Depends
from sqlalchemy import text

from app.database.database import SessionLocal
from app.ai.loader import model
from app.routers.collector import collector

from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/system",
    tags=["System"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/status")
def system_status():

    db = SessionLocal()

    database = False

    try:
        db.execute(text("SELECT 1"))
        database = True

    except Exception:
        database = False

    finally:
        db.close()

    return {
        "backend": True,
        "database": database,
        "collector": collector.running,
        "ai_model": model is not None,
        "model_name": "CNN-LSTM",
        "dataset": "NSL-KDD",
        "features": 20,
    }