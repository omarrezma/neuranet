import time

from scapy.layers.inet import IP, TCP, UDP

from app.collector.flow import Flow
from app.collector.service_map import port_to_service
from app.collector.connection_tracker import ConnectionTracker


class FlowTracker:
    """
    Tracks network flows and generates NSL-KDD features.
    """

    FLOW_TIMEOUT = 120

    def __init__(self):
        self.flows = {}
        self.connection_tracker = ConnectionTracker()

    def update(self, packet):
        """
        Process one packet.

        Returns
        -------
        dict | None
            Complete NSL-KDD feature dictionary
            or None if packet is unsupported.
        """

        if IP not in packet:
            return None

        ip = packet[IP]

        protocol = ip.proto

        src_port = 0
        dst_port = 0

        if TCP in packet:
            src_port = packet[TCP].sport
            dst_port = packet[TCP].dport

        elif UDP in packet:
            src_port = packet[UDP].sport
            dst_port = packet[UDP].dport

        key = (
            ip.src,
            src_port,
            ip.dst,
            dst_port,
            protocol,
        )

        if key not in self.flows:
            self.flows[key] = Flow(
                packet,
                protocol,
                src_port,
                dst_port,
            )

        flow = self.flows[key]

        self._update_flow(flow, packet)

        self._expire()

        return self.build_features(flow)

    def _update_flow(self, flow, packet):
        """
        Update flow statistics.
        """

        flow.last_time = time.time()

        length = len(packet)

        flow.pkt_count += 1
        flow.src_bytes += length

        if TCP in packet:

            flags = int(packet[TCP].flags)

            if flags & 0x02:
                flow.syn += 1

            if flags & 0x01:
                flow.fin += 1

            if flags & 0x04:
                flow.rst += 1

            if flags & 0x20:
                flow.urgent += 1

        if IP in packet:

            ip = packet[IP]

            try:

                if int(ip.flags) & 1 or ip.frag > 0:
                    flow.wrong_fragment += 1

            except Exception:
                pass

    def _expire(self):
        """
        Remove inactive flows.
        """

        now = time.time()

        expired = []

        for key, flow in self.flows.items():

            if now - flow.last_time > self.FLOW_TIMEOUT:
                expired.append(key)

        for key in expired:
            del self.flows[key]

    def build_features(self, flow):
        """
        Generate the complete NSL-KDD feature dictionary.
        """

        duration = max(
            flow.last_time - flow.start_time,
            0,
        )

        protocol = {
            1: "icmp",
            6: "tcp",
            17: "udp",
        }.get(flow.proto, "tcp")

        service = port_to_service(flow.dst_port)

        if flow.rst:
            flag = "REJ"

        elif flow.syn and not flow.fin:
            flag = "S0"

        else:
            flag = "SF"

        self.connection_tracker.update(
            flow,
            service,
            flag,
        )

        stats = self.connection_tracker.get_stats(
            flow,
            service,
            flag,
        )

        features = {

            "duration": duration,

            "protocol_type": protocol,

            "service": service,

            "flag": flag,

            "src_bytes": flow.src_bytes,

            "dst_bytes": flow.dst_bytes,

            "land": int(
                flow.src_ip == flow.dst_ip
                and flow.src_port == flow.dst_port
            ),

            "wrong_fragment": flow.wrong_fragment,

            "urgent": flow.urgent,

            "hot": flow.hot,

            "num_failed_logins": flow.num_failed_logins,

            "logged_in": flow.logged_in,

            "num_compromised": flow.num_compromised,

            "root_shell": flow.root_shell,

            "su_attempted": flow.su_attempted,

            "num_root": flow.num_root,

            "num_file_creations": flow.num_file_creations,

            "num_shells": flow.num_shells,

            "num_access_files": flow.num_access_files,

            "num_outbound_cmds": flow.num_outbound_cmds,

            "is_host_login": flow.is_host_login,

            "is_guest_login": flow.is_guest_login,
        }

        features.update(stats)

        return features