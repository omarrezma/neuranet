import platform
import subprocess


def ping(host: str = "8.8.8.8"):

    param = "-n" if platform.system().lower() == "windows" else "-c"

    command = ["ping", param, "1", host]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    return result.returncode == 0
import re


def latency(host="8.8.8.8"):

    param = "-n" if platform.system().lower() == "windows" else "-c"

    command = ["ping", param, "1", host]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    output = result.stdout

    match = re.search(r"time[=<]([\d\.]+)", output)

    if match:
        return float(match.group(1))

    return None