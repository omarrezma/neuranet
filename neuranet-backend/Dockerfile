FROM python:3.12-slim

# System deps: scapy/packet capture needs libpcap; psycopg2 needs libpq
# at build/runtime if you switch DATABASE_URL to Postgres.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpcap-dev \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# NOTE: live packet capture (scapy AsyncSniffer) needs NET_RAW/NET_ADMIN
# capabilities to see real traffic inside a container. Run with
# `--cap-add=NET_ADMIN --cap-add=NET_RAW --network host` if you need that,
# or leave AUTO_START_COLLECTOR / the /collector routes off for a plain
# API-only deployment.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
