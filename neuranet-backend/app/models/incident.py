from datetime import datetime

from pydantic import BaseModel


class Incident(BaseModel):
    device_name: str
    cpu: float
    memory: float
    packet_loss: float
    interface_errors: int
    timestamp: datetime