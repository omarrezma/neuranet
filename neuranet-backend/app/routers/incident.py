from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.database import SessionLocal
from app.models.incident_db import IncidentDB
from app.schemas.incident import IncidentCreate, IncidentResponse

from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"],
    dependencies=[Depends(get_current_user)],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=List[IncidentResponse])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(IncidentDB).all()


@router.post("/", response_model=IncidentResponse)
def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db)
):
    new_incident = IncidentDB(**incident.model_dump())

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return new_incident


@router.delete("/{incident_id}")
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = (
        db.query(IncidentDB)
        .filter(IncidentDB.id == incident_id)
        .first()
    )

    if incident:
        db.delete(incident)
        db.commit()

    return {"message": "Incident deleted successfully"}