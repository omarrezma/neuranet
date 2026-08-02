import os
from threading import Thread
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.database.database import Base, engine, SessionLocal
from app.logging_config import get_logger

# Models
from app.models.device import Device
from app.models.incident_db import IncidentDB
from app.models.incident import Incident
from app.models.user import User
from app.models.ai_prediction import AIPrediction
from app.models.alert import Alert
from app.models.settings import Settings

# Routers
from app.routers import maintenance 
from app.routers.settings import router as settings_router
from app.routers.auth import router as auth_router
from app.routers.device import router as device_router
from app.routers.dashboard import router as dashboard_router
from app.routers.incident import router as incident_router
from app.routers.analytics import router as analytics_router
from app.ai.router import router as ai_router
from app.routers.collector import (
    router as collector_router,
    collector,)
from app.routers.system import router as system_router
from app.routers.alerts import router as alerts_router

# AI
from app.reasoning_engine.reasoner import ReasoningEngine

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("=" * 70)
    logger.info("Starting NeuraNet...")
    logger.info("=" * 70)

    Base.metadata.create_all(bind=engine)

    # Tests set this so CI/test runs never attempt real packet capture,
    # which needs raw-socket privileges most CI runners and containers
    # don't have by default. This is a fast, deterministic skip rather
    # than relying only on the capture-failure handling below.
    if os.getenv("DISABLE_COLLECTOR_AUTOSTART", "").lower() in ("1", "true", "yes"):
        logger.info("Collector auto-start disabled via DISABLE_COLLECTOR_AUTOSTART.")
        yield
        logger.info("Shutting down NeuraNet...")
        return

    db = SessionLocal()

    try:
        settings = db.query(Settings).first()

        auto_start = True

        if settings:
            auto_start = settings.auto_start_collector

        if auto_start:

            if not collector.running:

                thread = Thread(
                    target=collector.start,
                    args=(db,),
                    daemon=True,
                )

                thread.start()

                logger.info("Live Packet Collector Started")

        else:
            logger.info("Auto Start Collector is disabled.")

    finally:
        db.close()

    yield

    logger.info("=" * 70)
    logger.info("Shutting down NeuraNet...")
    logger.info("=" * 70)

    if collector.running:
        try:
            collector.stop()
        except Exception:
            logger.exception("Error while stopping collector during shutdown")

    logger.info("Collector stopped")


app = FastAPI(
    title="NeuraNet API",
    version="1.0.0",
    description="Enterprise Network Intelligence Platform",
    lifespan=lifespan,
)

# -------------------- Rate limiting --------------------
# Applied per-route (see app/routers/auth.py for the /auth/login limit).

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# -------------------- CORS --------------------

_default_origins = "http://localhost:3000,http://127.0.0.1:3000"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Static --------------------

app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static",
)

templates = Jinja2Templates(
    directory="app/templates"
)

# -------------------- AI --------------------

reasoner = ReasoningEngine()

# -------------------- Routers --------------------

app.include_router(settings_router)
app.include_router(auth_router)
app.include_router(device_router)
app.include_router(dashboard_router)
app.include_router(incident_router)
app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(collector_router)
app.include_router(alerts_router)
app.include_router(system_router)
app.include_router(maintenance.router)
# -------------------- Root --------------------

@app.get("/")
def root():

    return {
        "message": "Welcome to NeuraNet API",
        "version": app.version,
        "status": "Running",
    }


# -------------------- Dashboard --------------------

@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request):

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
        },
    )


# -------------------- AI Analysis --------------------

@app.post("/analyze")
def analyze(incident: Incident):

    return reasoner.analyze(incident)


# -------------------- Health --------------------

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "NeuraNet",
        "collector_running": collector.running,
    }


@app.get("/ai/test")
def ai_test():

    return {
        "status": "AI Loaded",
    }