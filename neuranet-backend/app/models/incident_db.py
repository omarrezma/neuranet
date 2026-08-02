from datetime import datetime

from sqlalchemy import Integer, String, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class IncidentDB(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    device_name: Mapped[str] = mapped_column(String(50))

    cpu: Mapped[float] = mapped_column(Float)

    memory: Mapped[float] = mapped_column(Float)

    packet_loss: Mapped[float] = mapped_column(Float)

    interface_errors: Mapped[int] = mapped_column(Integer)

    timestamp: Mapped[datetime] = mapped_column(DateTime)