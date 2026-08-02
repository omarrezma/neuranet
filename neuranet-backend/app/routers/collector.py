from threading import Thread

from fastapi import APIRouter, Depends

from app.collector.collector import CollectorService

from app.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/collector",
    tags=["Collector"],
    dependencies=[Depends(get_current_user)],
)

collector = CollectorService()

collector_thread = None


@router.post("/start")
def start_capture():

    global collector_thread

    if collector.running:
        return {
            "status": "Collector already running"
        }

    collector_thread = Thread(
        target=collector.start,
        daemon=True,
    )

    collector_thread.start()

    return {
        "status": "Collector started successfully"
    }


@router.post("/stop")
def stop_capture():

    if not collector.running:
        return {
            "status": "Collector already stopped"
        }

    collector.stop()

    return {
        "status": "Collector stopped successfully"
    }


@router.get("/status")
def collector_status():

    return {
        "running": collector.running
    }