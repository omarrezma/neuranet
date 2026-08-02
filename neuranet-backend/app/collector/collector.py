import socket
from datetime import datetime

import psutil
from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.models.settings import Settings
from app.services.incident_manager import IncidentManager
from app.collector.packet_capture import PacketCapture
from app.database.database import SessionLocal
from app.logging_config import get_logger

logger = get_logger(__name__)


class NetworkCollector:
    """
    Collects system health metrics for the dashboard.
    """

    def collect(self):

        cpu = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory().percent
        stats = psutil.net_io_counters()

        packet_loss = 0.0

        interface_errors = (
            stats.errin + stats.errout
            if hasattr(stats, "errin") and hasattr(stats, "errout")
            else 0
        )

        timestamp = datetime.now()

        incident = Incident(
            device_name=socket.gethostname(),
            cpu=cpu,
            memory=memory,
            packet_loss=packet_loss,
            interface_errors=interface_errors,
            timestamp=timestamp,
        )

        IncidentManager.save_if_needed(incident)

        return incident


class CollectorService:
    """
    Controls the live packet capture service.
    """

    def __init__(self):

        self.capture = None

    @property
    def running(self):

        if self.capture is None:
            return False

        return self.capture.running

    def start(self, db: Session = None):

        if self.running:
            logger.warning("Collector already running.")
            return

        interface = None

        # Always read settings using our OWN short-lived session.
        # Never rely on a session passed in from the caller, since it
        # may be closed by the caller before this thread finishes
        # using it.
        own_db = SessionLocal()

        try:
            settings = own_db.query(Settings).first()

            if settings and settings.network_interface:
                interface = settings.network_interface

        finally:
            own_db.close()

        logger.info("Starting Collector Service... (interface=%r)", interface)

        self.capture = PacketCapture(interface=interface)

        self.capture.start()

    def stop(self):

        if not self.running:
            logger.warning("Collector already stopped.")
            return

        logger.info("Stopping Collector Service...")

        self.capture.stop()