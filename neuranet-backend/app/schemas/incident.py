from datetime import datetime
from pydantic import BaseModel


class IncidentCreate(BaseModel):
    device_name: str
    cpu: float
    memory: float
    packet_loss: float
    interface_errors: int
    timestamp: datetime


class IncidentResponse(IncidentCreate):
    id: int

    class Config:
        from_attributes = True