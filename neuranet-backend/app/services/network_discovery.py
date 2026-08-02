import socket

from scapy.all import ARP, Ether, srp


class NetworkDiscovery:

    @staticmethod
    def scan(network="192.168.1.0/24"):

        packet = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=network)

        result = srp(
            packet,
            timeout=2,
            verbose=False,
        )[0]

        devices = []

        for _, received in result:

            ip = received.psrc
            mac = received.hwsrc

            try:
                hostname = socket.gethostbyaddr(ip)[0]
            except Exception:
                hostname = "Unknown"

            devices.append({
                "hostname": hostname,
                "ip_address": ip,
                "mac_address": mac,
                "vendor": "Unknown",
                "device_type": "Unknown",
                "status": "Online",
            })

        return devices