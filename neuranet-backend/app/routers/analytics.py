from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.models.incident_db import IncidentDB

from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):

    total_incidents = db.query(IncidentDB).count()

    average_cpu = db.query(func.avg(IncidentDB.cpu)).scalar() or 0

    average_memory = db.query(func.avg(IncidentDB.memory)).scalar() or 0

    max_cpu = db.query(func.max(IncidentDB.cpu)).scalar() or 0

    max_memory = db.query(func.max(IncidentDB.memory)).scalar() or 0

    return {
        "total_incidents": total_incidents,
        "average_cpu": round(average_cpu, 2),
        "average_memory": round(average_memory, 2),
        "max_cpu": max_cpu,
        "max_memory": max_memory
    }