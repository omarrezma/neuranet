from scapy.layers.inet import IP, TCP, UDP

SERVICE_PORTS = {
    20: "ftp_data",
    21: "ftp",
    22: "ssh",
    23: "telnet",
    25: "smtp",
    53: "domain",
    80: "http",
    110: "pop_3",
    143: "imap4",
    443: "http_443",
}


def get_service(port):
    return SERVICE_PORTS.get(port, "private")


def get_flag(packet):
    if TCP not in packet:
        return "SF"

    flags = packet[TCP].flags

    if flags & 0x04:
        return "REJ"

    if flags & 0x02 and not (flags & 0x10):
        return "S0"

    return "SF"


def extract(packet, tracker):
    """
    Extract the complete 41 NSL-KDD features from one packet.
    """

    if IP not in packet:
        return None

    ip = packet[IP]

    protocol = "other"
    src_port = 0
    dst_port = 0

    if TCP in packet:
        protocol = "tcp"
        src_port = packet[TCP].sport
        dst_port = packet[TCP].dport

    elif UDP in packet:
        protocol = "udp"
        src_port = packet[UDP].sport
        dst_port = packet[UDP].dport

    elif ip.proto == 1:
        protocol = "icmp"

    service = get_service(dst_port)
    flag = get_flag(packet)

    features = {
        "duration": 0,
        "protocol_type": protocol,
        "service": service,
        "flag": flag,
        "src_bytes": len(packet),
        "dst_bytes": 0,
        "land": int(ip.src == ip.dst),
        "wrong_fragment": int(ip.frag > 0),
        "urgent": 0,
        "hot": 0,
        "num_failed_logins": 0,
        "logged_in": 0,
        "num_compromised": 0,
        "root_shell": 0,
        "su_attempted": 0,
        "num_root": 0,
        "num_file_creations": 0,
        "num_shells": 0,
        "num_access_files": 0,
        "num_outbound_cmds": 0,
        "is_host_login": 0,
        "is_guest_login": 0,
    }

    tracker.add(
        src_ip=ip.src,
        dst_ip=ip.dst,
        service=service,
        src_port=src_port,
        feature=features,
    )

    return tracker.compute(features)