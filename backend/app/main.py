

from datetime import datetime

from app.models.incident import Incident
from app.reasoning_engine.reasoner import ReasoningEngine

incident = Incident(
    device_name="Router-01",
    cpu=95,
    memory=45,
    packet_loss=8,
    interface_errors=20,
    timestamp=datetime.now()
)

engine = ReasoningEngine()

result = engine.analyze(incident)

print(result)