from collections import deque
import time


class ConnectionTracker:
    """
    Maintains recent connections to compute NSL-KDD traffic features.
    """

    WINDOW = 2          # seconds (NSL-KDD time window)
    HOST_WINDOW = 100   # last 100 connections

    def __init__(self):
        self.connections = deque(maxlen=5000)

    def update(self, flow, service, flag):
        now = time.time()

        self.connections.append({
            "time": now,
            "src": flow.src_ip,
            "dst": flow.dst_ip,
            "src_port": flow.src_port,
            "dst_port": flow.dst_port,
            "service": service,
            "flag": flag,
        })

    def get_stats(self, flow, service, flag):
        now = time.time()

        recent = [
            c for c in self.connections
            if now - c["time"] <= self.WINDOW
        ]

        host_recent = [
            c for c in self.connections
            if c["dst"] == flow.dst_ip
        ][-self.HOST_WINDOW:]

        count = len([
            c for c in recent
            if c["dst"] == flow.dst_ip
        ])

        srv_count = len([
            c for c in recent
            if c["service"] == service
        ])

        same_srv_rate = (
            srv_count / count
            if count else 0
        )

        diff_srv_rate = (
            (count - srv_count) / count
            if count else 0
        )

        serror = len([
            c for c in recent
            if c["flag"] == "S0"
        ])

        rerror = len([
            c for c in recent
            if c["flag"] == "REJ"
        ])

        serror_rate = (
            serror / count
            if count else 0
        )

        rerror_rate = (
            rerror / count
            if count else 0
        )

        dst_host_count = len(host_recent)

        dst_host_srv_count = len([
            c for c in host_recent
            if c["service"] == service
        ])

        dst_host_same_srv_rate = (
            dst_host_srv_count / dst_host_count
            if dst_host_count else 0
        )

        dst_host_diff_srv_rate = (
            (dst_host_count - dst_host_srv_count)
            / dst_host_count
            if dst_host_count else 0
        )

        dst_host_same_src_port_rate = (
            len([
                c for c in host_recent
                if c["src_port"] == flow.src_port
            ]) / dst_host_count
            if dst_host_count else 0
        )

        dst_host_srv_diff_host_rate = (
            len({
                c["src"]
                for c in host_recent
                if c["service"] == service
            }) / dst_host_srv_count
            if dst_host_srv_count else 0
        )

        dst_host_serror = len([
            c for c in host_recent
            if c["flag"] == "S0"
        ])

        dst_host_rerror = len([
            c for c in host_recent
            if c["flag"] == "REJ"
        ])

        return {
            "count": count,
            "srv_count": srv_count,
            "serror_rate": serror_rate,
            "srv_serror_rate": serror_rate,
            "rerror_rate": rerror_rate,
            "srv_rerror_rate": rerror_rate,
            "same_srv_rate": same_srv_rate,
            "diff_srv_rate": diff_srv_rate,
            "srv_diff_host_rate": 0.0,
            "dst_host_count": dst_host_count,
            "dst_host_srv_count": dst_host_srv_count,
            "dst_host_same_srv_rate": dst_host_same_srv_rate,
            "dst_host_diff_srv_rate": dst_host_diff_srv_rate,
            "dst_host_same_src_port_rate": dst_host_same_src_port_rate,
            "dst_host_srv_diff_host_rate": dst_host_srv_diff_host_rate,
            "dst_host_serror_rate": (
                dst_host_serror / dst_host_count
                if dst_host_count else 0
            ),
            "dst_host_srv_serror_rate": (
                dst_host_serror / dst_host_srv_count
                if dst_host_srv_count else 0
            ),
            "dst_host_rerror_rate": (
                dst_host_rerror / dst_host_count
                if dst_host_count else 0
            ),
            "dst_host_srv_rerror_rate": (
                dst_host_rerror / dst_host_srv_count
                if dst_host_srv_count else 0
            ),
        }