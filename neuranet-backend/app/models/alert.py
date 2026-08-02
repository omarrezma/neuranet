from datetime import datetime

from sqlalchemy import Integer, String, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    src_ip: Mapped[str] = mapped_column(String(50))
    dst_ip: Mapped[str] = mapped_column(String(50))

    src_port: Mapped[int] = mapped_column(Integer)
    dst_port: Mapped[int] = mapped_column(Integer)

    protocol: Mapped[str] = mapped_column(String(20))

    prediction: Mapped[str] = mapped_column(String(20))

    confidence: Mapped[float] = mapped_column(Float)

    probability: Mapped[float] = mapped_column(Float)