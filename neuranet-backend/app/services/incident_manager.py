from app.database.database import SessionLocal
from app.models.incident_db import IncidentDB


class IncidentManager:

    CPU_THRESHOLD = 5
    MEMORY_THRESHOLD = 5

    @staticmethod
    def save_if_needed(data):

        db = SessionLocal()

        try:

            last = (
                db.query(IncidentDB)
                .order_by(IncidentDB.id.desc())
                .first()
            )

            if last is None:
                save = True
            else:

                save = (
                    abs(data.cpu - last.cpu) >= IncidentManager.CPU_THRESHOLD
                    or abs(data.memory - last.memory) >= IncidentManager.MEMORY_THRESHOLD
                    or data.interface_errors != last.interface_errors
                    or data.packet_loss != last.packet_loss
                )

            if save:

                incident = IncidentDB(
                    device_name=data.device_name,
                    cpu=data.cpu,
                    memory=data.memory,
                    packet_loss=data.packet_loss,
                    interface_errors=data.interface_errors,
                    timestamp=data.timestamp,
                )

                db.add(incident)
                db.commit()

        finally:
            db.close()