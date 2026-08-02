from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.device import Device
from app.schemas.device import DeviceCreate
from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/devices",
    tags=["Devices"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_device(
    device: DeviceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    new_device = Device(
        hostname=device.hostname,
        ip_address=device.ip_address,
        mac_address=device.mac_address,
        vendor=device.vendor,
        device_type=device.device_type,
        status=device.status,
    )

    db.add(new_device)
    db.commit()
    db.refresh(new_device)

    return new_device


@router.get("/")
def get_devices(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return db.query(Device).all()


@router.get("/{device_id}")
def get_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    device = db.query(Device).filter(Device.id == device_id).first()

    if not device:
        raise HTTPException(
            status_code=404,
            detail="Device not found",
        )

    return device


@router.put("/{device_id}")
def update_device(
    device_id: int,
    updated: DeviceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    device = db.query(Device).filter(Device.id == device_id).first()

    if not device:
        raise HTTPException(
            status_code=404,
            detail="Device not found",
        )

    device.hostname = updated.hostname
    device.ip_address = updated.ip_address
    device.mac_address = updated.mac_address
    device.vendor = updated.vendor
    device.device_type = updated.device_type
    device.status = updated.status

    db.commit()
    db.refresh(device)

    return device


@router.delete("/{device_id}")
def delete_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    device = db.query(Device).filter(Device.id == device_id).first()

    if not device:
        raise HTTPException(
            status_code=404,
            detail="Device not found",
        )

    db.delete(device)
    db.commit()

    return {
        "message": "Device deleted successfully",
    }