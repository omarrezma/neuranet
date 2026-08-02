from collections import defaultdict
from time import time


class NSLFeatureExtractor:

    def __init__(self):

        self.connections = []

    def update(self, feature):

        now = time()

        feature["timestamp"] = now

        self.connections.append(feature)

        # Keep last 2 seconds
        self.connections = [
            c for c in self.connections
            if now - c["timestamp"] <= 2
        ]

    def compute(self, feature):

        src = feature["src_ip"]
        dst = feature["dst_ip"]
        service = feature["service"]

        related = [
            c for c in self.connections
            if c["src_ip"] == src and c["dst_ip"] == dst
        ]

        same_service = [
            c for c in related
            if c["service"] == service
        ]

        count = len(related)
        srv_count = len(same_service)

        feature["count"] = count
        feature["srv_count"] = srv_count

        feature["same_srv_rate"] = (
            srv_count / count if count else 0
        )

        feature["diff_srv_rate"] = (
            1 - feature["same_srv_rate"]
            if count else 0
        )

        feature["dst_host_count"] = count
        feature["dst_host_srv_count"] = srv_count
        feature["dst_host_same_srv_rate"] = feature["same_srv_rate"]
        feature["dst_host_diff_srv_rate"] = feature["diff_srv_rate"]

        feature["dst_host_srv_diff_host_rate"] = 0

        feature["serror_rate"] = 0
        feature["srv_serror_rate"] = 0
        feature["rerror_rate"] = 0
        feature["srv_rerror_rate"] = 0

        feature["dst_host_serror_rate"] = 0
        feature["dst_host_srv_serror_rate"] = 0
        feature["dst_host_rerror_rate"] = 0
        feature["dst_host_srv_rerror_rate"] = 0

        return feature


extractor = NSLFeatureExtractor()