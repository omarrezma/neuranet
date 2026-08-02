from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Settings(Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    app_name: Mapped[str] = mapped_column(
        String(100),
        default="NeuraNet",
    )

    company_name: Mapped[str] = mapped_column(
        String(100),
        default="My Company",
    )

    timezone: Mapped[str] = mapped_column(
        String(50),
        default="UTC",
    )

    confidence_threshold: Mapped[float] = mapped_column(
        Float,
        default=0.30,
    )

    auto_detect: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    auto_save_alerts: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    network_interface: Mapped[str] = mapped_column(
        String(100),
        default="Default",
    )

    capture_filter: Mapped[str] = mapped_column(
        String(100),
        default="",
    )

    auto_start_collector: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )