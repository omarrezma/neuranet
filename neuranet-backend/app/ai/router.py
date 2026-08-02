from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from .schemas import PredictionRequest, PredictionResponse
from .service import AIService

from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["Artificial Intelligence"],
    dependencies=[Depends(get_current_user)],
)


@router.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(
    request: PredictionRequest,
    db: Session = Depends(get_db)
):
    try:
        return AIService.predict(
            request.model_dump(),
            db
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/history")
def history(
    db: Session = Depends(get_db)
):
    try:
        return AIService.history(db)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )