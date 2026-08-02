from datetime import datetime

from sqlalchemy.orm import Session

from app.models.device import Device


class DeviceDiscovery:

    @staticmethod
    def update_device(
        db: Session,
        hostname: str,
        ip: str,
        mac: str,
    ):

        device = (
            db.query(Device)
            .filter(Device.ip_address == ip)
            .first()
        )

        if device:

            device.hostname = hostname
            device.mac_address = mac
            device.status = "Online"
            device.last_seen = datetime.utcnow()

        else:

            device = Device(
                hostname=hostname,
                ip_address=ip,
                mac_address=mac,
                vendor="Unknown",
                device_type="Unknown",
                status="Online",
                last_seen=datetime.utcnow(),
            )

            db.add(device)

        # IMPORTANT:
        # Do NOT commit here.
        # The caller is responsible for committing.