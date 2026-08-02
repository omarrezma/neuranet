from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.alert import Alert

from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
    dependencies=[Depends(get_current_user)],
)

@router.get("/")
def get_alerts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    # Prevent someone from requesting an excessive number of rows
    limit = min(limit, 100)

    alerts = (
        db.query(Alert)
        .order_by(Alert.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return alerts