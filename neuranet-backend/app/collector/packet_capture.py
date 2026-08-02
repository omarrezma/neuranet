import socket

from scapy.all import AsyncSniffer
from scapy.layers.inet import IP, TCP, UDP
from scapy.layers.l2 import Ether

from app.collector.flow_tracker import FlowTracker
from app.ai.service import AIService
from app.database.database import SessionLocal
from app.database.crud_alert import create_alert
from app.services.device_discovery import DeviceDiscovery
from app.logging_config import get_logger

logger = get_logger(__name__)


class PacketCapture:
    """
    Live packet capture using AsyncSniffer.
    """

    def __init__(self, interface=None):
        self.interface = interface
        self.tracker = FlowTracker()
        self.sniffer = None
        self.running = False

    def process_packet(self, packet):
        logger.debug("Packet received")

        # Ignore non-IP packets
        if IP not in packet:
            return

        # Build flow features
        features = self.tracker.update(packet)

        if features is None:
            return

        # Wait until TCP connection finishes
        if TCP in packet:
            flags = int(packet[TCP].flags)

            # FIN or RST
            if not (flags & 0x01 or flags & 0x04):
                return

        # ---------------- AI Prediction ----------------

        db = SessionLocal()

        try:
            result = AIService.predict(
                data=features,
                db=db,
            )
        except Exception as e:
            logger.error("Prediction error: %s", e)
            db.close()
            return

        logger.info(
            "Intrusion Detection Result | Prediction=%s Confidence=%.2f%% Probability=%.4f",
            result["prediction"],
            result["confidence"],
            result["probability"],
        )

        # ---------------- Packet Information ----------------

        protocol = "OTHER"
        src_port = 0
        dst_port = 0

        if TCP in packet:
            protocol = "TCP"
            src_port = packet[TCP].sport
            dst_port = packet[TCP].dport

        elif UDP in packet:
            protocol = "UDP"
            src_port = packet[UDP].sport
            dst_port = packet[UDP].dport

        alert_data = {
            "src_ip": packet[IP].src,
            "dst_ip": packet[IP].dst,
            "src_port": src_port,
            "dst_port": dst_port,
            "protocol": protocol,
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "probability": result["probability"],
        }

        try:

            # ---------------- Device Discovery ----------------

            try:
                hostname = socket.gethostbyaddr(packet[IP].src)[0]
            except Exception:
                hostname = "Unknown"

            mac = "Unknown"

            if Ether in packet:
                mac = packet[Ether].src

            DeviceDiscovery.update_device(
                db=db,
                hostname=hostname,
                ip=packet[IP].src,
                mac=mac,
            )

            # ---------------- Save Alert ----------------

            create_alert(db, alert_data)

            # Single commit for this packet
            db.commit()

            logger.info("Device updated and alert saved successfully")

        except Exception as e:

            db.rollback()

            logger.error("Database error while saving alert: %s: %s", type(e).__name__, e)

        finally:
            db.close()

    def start(self):

        if self.running:
            logger.warning("Packet capture is already running.")
            return

        logger.info("Starting live packet capture...")

        self.sniffer = AsyncSniffer(
            iface=self.interface,
            prn=self.process_packet,
            store=False,
        )

        self.sniffer.start()

        self.running = True

        logger.info("Packet capture started.")

    def stop(self):

        if not self.running:
            logger.warning("Packet capture is not running.")
            return

        logger.info("Stopping packet capture...")

        if self.sniffer is not None:
            try:
                self.sniffer.stop()
            except PermissionError:
                # AsyncSniffer defers socket-permission failures: if the
                # process doesn't have raw-socket privileges (no root /
                # no CAP_NET_RAW+CAP_NET_ADMIN — e.g. CI runners, most
                # containers by default), scapy only raises this when
                # .stop() is called, not when .start() was. Treat it as
                # "capture never actually ran" rather than crashing
                # shutdown.
                logger.warning(
                    "Packet capture could not run (missing raw-socket "
                    "privileges). Skipping — see deployment docs for "
                    "required capabilities (NET_RAW, NET_ADMIN)."
                )
            except Exception:
                logger.exception("Error while stopping packet capture")

        self.sniffer = None
        self.running = False

        logger.info("Packet capture stopped.")