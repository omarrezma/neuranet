from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.auth.dependencies import get_current_user

from app.models.device import Device
from app.models.incident_db import IncidentDB
from app.models.alert import Alert
from app.models.ai_prediction import AIPrediction

router = APIRouter(
    prefix="/maintenance",
    tags=["Maintenance"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.delete("/devices")
def clear_devices(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deleted = db.query(Device).delete()
    db.commit()

    return {
        "message": "Devices cleared successfully",
        "deleted": deleted,
    }


@router.delete("/incidents")
def clear_incidents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deleted = db.query(IncidentDB).delete()
    db.commit()

    return {
        "message": "Incidents cleared successfully",
        "deleted": deleted,
    }


@router.delete("/alerts")
def clear_alerts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deleted = db.query(Alert).delete()
    db.commit()

    return {
        "message": "Alerts cleared successfully",
        "deleted": deleted,
    }


@router.delete("/predictions")
def clear_predictions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deleted = db.query(AIPrediction).delete()
    db.commit()

    return {
        "message": "Predictions cleared successfully",
        "deleted": deleted,
    }


@router.delete("/all")
def clear_all(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    predictions = db.query(AIPrediction).delete()
    alerts = db.query(Alert).delete()
    incidents = db.query(IncidentDB).delete()
    devices = db.query(Device).delete()

    db.commit()

    return {
        "message": "Application data cleared successfully",
        "devices": devices,
        "incidents": incidents,
        "alerts": alerts,
        "predictions": predictions,
    }