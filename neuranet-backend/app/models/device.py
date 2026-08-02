from datetime import datetime

from sqlalchemy import Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    hostname: Mapped[str] = mapped_column(String(100))

    ip_address: Mapped[str] = mapped_column(String(50), unique=True)

    mac_address: Mapped[str] = mapped_column(String(50))

    vendor: Mapped[str] = mapped_column(String(100))

    device_type: Mapped[str] = mapped_column(String(50))

    status: Mapped[str] = mapped_column(String(20))

    last_seen: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )