from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func

from app.collector.collector import NetworkCollector
from app.reasoning_engine.reasoner import ReasoningEngine

from app.database.database import SessionLocal
from app.models.alert import Alert
from app.models.device import Device

from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/api",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_user)],
)

collector = NetworkCollector()
reasoner = ReasoningEngine()


@router.get("/stats")
def get_stats():

    incident = collector.collect()
    analysis = reasoner.analyze(incident)

    return {
        "device": incident.device_name,
        "cpu": incident.cpu,
        "memory": incident.memory,
        "packet_loss": incident.packet_loss,
        "interface_errors": incident.interface_errors,
        "timestamp": incident.timestamp,
        "prediction": analysis,
    }


@router.get("/security")
def security_dashboard():

    db = SessionLocal()

    try:

        total_packets = db.query(Alert).count()

        attacks = (
            db.query(Alert)
            .filter(Alert.prediction == "Attack")
            .count()
        )

        normal = (
            db.query(Alert)
            .filter(Alert.prediction == "Normal")
            .count()
        )

        devices = db.query(Device).count()

        average_confidence = (
            db.query(func.avg(Alert.confidence)).scalar() or 0
        )

        high_confidence = (
            db.query(Alert)
            .filter(Alert.confidence >= 90)
            .count()
        )

        return {
            "total_packets": total_packets,
            "attacks": attacks,
            "normal": normal,
            "devices": devices,
            "alerts": total_packets,
            "average_confidence": round(
                average_confidence,
                2,
            ),
            "high_confidence": high_confidence,
        }

    finally:
        db.close()


@router.get("/attack-trend")
def attack_trend():

    db = SessionLocal()

    try:

        since = datetime.utcnow() - timedelta(hours=24)

        alerts = (
            db.query(Alert.timestamp)
            .filter(
                Alert.prediction == "Attack",
                Alert.timestamp >= since,
            )
            .all()
        )

        # Group by hour in Python instead of a SQL date_trunc() call —
        # date_trunc is PostgreSQL-only and errors out on SQLite, which is
        # this project's default local/dev database.
        counts_by_hour = {}
        for (timestamp,) in alerts:
            hour_bucket = timestamp.replace(minute=0, second=0, microsecond=0)
            counts_by_hour[hour_bucket] = counts_by_hour.get(hour_bucket, 0) + 1

        return [
            {
                "time": hour.strftime("%H:%M"),
                "attacks": count,
            }
            for hour, count in sorted(counts_by_hour.items())
        ]

    finally:
        db.close()


@router.get("/dashboard-cards")
def dashboard_cards():

    db = SessionLocal()

    try:

        devices = db.query(Device).count()

        alerts = db.query(Alert).count()

        attacks = (
            db.query(Alert)
            .filter(Alert.prediction == "Attack")
            .count()
        )

        normal = (
            db.query(Alert)
            .filter(Alert.prediction == "Normal")
            .count()
        )

        average_confidence = (
            db.query(func.avg(Alert.confidence)).scalar() or 0
        )

        return {
            "devices": devices,
            "alerts": alerts,
            "attacks": attacks,
            "normal": normal,
            "average_confidence": round(
                average_confidence,
                2,
            ),
            "collector_status": "Running",
        }

    finally:
        db.close()