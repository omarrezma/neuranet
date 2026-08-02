from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DeviceCreate(BaseModel):
    hostname: str
    ip_address: str
    mac_address: Optional[str] = "Unknown"
    vendor: Optional[str] = "Unknown"
    device_type: Optional[str] = "Unknown"
    status: Optional[str] = "Online"


class DeviceResponse(DeviceCreate):
    id: int
    last_seen: datetime

    class Config:
        from_attributes = True