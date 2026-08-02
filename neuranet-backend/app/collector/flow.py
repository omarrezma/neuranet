from scapy.layers.inet import IP


class Flow:
    __slots__ = (
        "start_time",
        "last_time",
        "proto",

        "src_ip",
        "dst_ip",

        "src_port",
        "dst_port",

        "src_bytes",
        "dst_bytes",
        "pkt_count",

        "wrong_fragment",
        "urgent",

        "syn",
        "fin",
        "rst",

        "logged_in",
        "is_guest_login",

        "hot",
        "num_failed_logins",
        "num_compromised",

        "root_shell",
        "su_attempted",
        "num_root",

        "num_file_creations",
        "num_shells",
        "num_access_files",
        "num_outbound_cmds",

        "is_host_login",

        "classified",
    )

    def __init__(self, packet, proto, src_port, dst_port):

        ip = packet[IP]
        t = float(packet.time)

        self.start_time = t
        self.last_time = t

        self.proto = proto

        self.src_ip = ip.src
        self.dst_ip = ip.dst

        self.src_port = src_port
        self.dst_port = dst_port

        self.src_bytes = 0
        self.dst_bytes = 0
        self.pkt_count = 0

        self.wrong_fragment = 0
        self.urgent = 0

        self.syn = 0
        self.fin = 0
        self.rst = 0

        self.logged_in = 0
        self.is_guest_login = 0

        self.hot = 0
        self.num_failed_logins = 0
        self.num_compromised = 0

        self.root_shell = 0
        self.su_attempted = 0
        self.num_root = 0

        self.num_file_creations = 0
        self.num_shells = 0
        self.num_access_files = 0
        self.num_outbound_cmds = 0

        self.is_host_login = 0

        self.classified = False