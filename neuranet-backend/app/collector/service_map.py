PORT_TO_SERVICE = {
    20: "ftp_data",
    21: "ftp",
    22: "ssh",
    23: "telnet",
    25: "smtp",
    53: "domain_u",
    67: "private",
    68: "private",
    69: "tftp_u",
    79: "finger",
    80: "http",
    88: "private",
    110: "pop_3",
    111: "sunrpc",
    113: "auth",
    119: "nntp",
    123: "ntp_u",
    135: "private",
    137: "netbios_ns",
    138: "netbios_dgm",
    139: "netbios_ssn",
    143: "imap4",
    161: "private",
    389: "ldap",
    443: "http_443",
    445: "private",
    514: "shell",
    515: "printer",
    587: "smtp",
    636: "private",
    993: "imap4",
    995: "pop_3",
    1080: "private",
    3306: "private",
    3389: "private",
    5432: "private",
    5900: "private",
    6667: "IRC",
    8001: "http_8001",
    8080: "http",
    8443: "http_443",
}


def port_to_service(port: int) -> str:
    if port in PORT_TO_SERVICE:
        return PORT_TO_SERVICE[port]

    if port >= 1024:
        return "private"

    return "other"