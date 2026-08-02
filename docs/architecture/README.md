# Architecture

This document describes how data moves through NeuraNet, from a raw packet on
the wire to an alert an analyst can act on.

## System overview

```
                        ┌─────────────────────────────────────────────┐
                        │                 Network                     │
                        │        (LAN traffic / attached NIC)         │
                        └───────────────────────┬───────────────────-─┘
                                                 │ raw packets
                                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  neuranet-backend  (FastAPI, single process, background thread)    │
│                                                                     │
│   collector/                                                       │
│   ├─ packet_capture.py   Scapy AsyncSniffer, reads from the NIC    │
│   ├─ flow_tracker.py     groups packets into bidirectional flows   │
│   ├─ connection_tracker.py  tracks connection state / duration     │
│   └─ feature_extractor.py, nsl_features.py                        │
│        └─ derives NSL-KDD-style features per flow                 │
│                          │                                         │
│                          ▼                                         │
│   ai/                                                              │
│   ├─ loader.py           loads the trained model + preprocessing  │
│   ├─ predictor.py        scales/encodes features, runs inference  │
│   └─ predict.py, service.py  wraps predictions as AIPrediction    │
│                          │                                         │
│                          ▼                                         │
│   services/incident_manager.py                                    │
│   └─ predictions above the alert threshold become Alert rows;     │
│      reasoning_engine/reasoner.py turns them into a human-         │
│      readable Incident with a plain-language explanation          │
│                          │                                         │
│                          ▼                                         │
│   database/  (SQLAlchemy ORM: Device, Alert, Incident,            │
│               AIPrediction, User, Settings)                        │
│                          │                                         │
│                          ▼                                         │
│   routers/  (REST API, JWT-gated via auth/dependencies.py)        │
└───────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS / JSON (JWT bearer token)
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│  neuranet-frontend  (React 19 SPA, Vite build, served by nginx)     │
│                                                                     │
│   api/          axios clients, one module per resource             │
│   routes/       ProtectedRoute — redirects to /login if no token   │
│   views/        dashboard, alerts, devices, analytics, incidents,   │
│                 analysis (AI), settings, landing                    │
│   components/   shared cards, tables, hand-rolled SVG charts        │
└────────────────────────────────────────────────────────────────────┘
```

## Request/detection flow

1. **Capture** — `collector/packet_capture.py` starts a Scapy `AsyncSniffer`
   on the configured interface (`COLLECTOR_INTERFACE`) in a background
   thread started from the FastAPI `lifespan` handler in `main.py`.
2. **Flow assembly** — `flow_tracker.py` / `connection_tracker.py` group raw
   packets into bidirectional flows and track connection state and duration,
   mirroring how NSL-KDD-style datasets define a "connection."
3. **Feature extraction** — `feature_extractor.py` and `nsl_features.py`
   derive the same class of statistical/categorical features the model was
   trained on (bytes transferred, duration, service, flag, error rates,
   etc.).
4. **Inference** — `ai/predictor.py` applies the saved scikit-learn
   preprocessing pipeline (scaling, feature selection, categorical
   encoding) and scores the flow with the trained CNN-LSTM model
   (`ai/models/model.h5`).
5. **Alerting** — `services/incident_manager.py` persists predictions
   (`AIPrediction`) and, above a confidence threshold, creates an `Alert`.
6. **Reasoning** — `reasoning_engine/reasoner.py` converts a raw
   prediction + flow context into an `Incident` with a plain-language
   explanation an analyst can read without knowing the model internals.
7. **Delivery** — the React dashboard polls the REST API
   (`/alerts`, `/incidents`, `/api/*` dashboard aggregates) and renders
   results in real time; every request carries the JWT issued at login.

## Why these boundaries

- **`collector/` is isolated from `ai/`** so the feature-extraction logic
  can be tested and reasoned about independently of the model, and so the
  model can be retrained/replaced without touching the capture pipeline.
- **`reasoning_engine/` is separate from `ai/`** because "what did the
  model predict" and "how do we explain that to a human" are different
  concerns with different failure modes — the former is a numeric
  classification, the latter is a presentation/UX problem.
- **Auth is a dependency, not a decorator scattered per-route** —
  `auth/dependencies.py` exposes `get_current_user` as a FastAPI
  `Depends`, so every router opts in explicitly and it's obvious from the
  function signature which routes are protected.

## Known architectural trade-offs

These are deliberate, documented trade-offs for a single-tenant/portfolio
deployment, not oversights — see the [Roadmap](../../README.md#roadmap) in
the main README for what would change for a multi-tenant production
deployment:

- The collector runs in-process (a background thread), not as a separate
  worker/service — simpler to run and demo, but means capture and API share
  one Python process and one failure domain.
- The dashboard polls REST endpoints rather than subscribing to a
  WebSocket/event stream — simpler, at the cost of update latency.
- There is no message queue between capture and inference — flows are
  scored synchronously in the collector thread, which is fine at LAN scale
  but wouldn't scale to a high-throughput mirror port without a buffer.
