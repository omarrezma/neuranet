from app.models.incident import Incident


class ReasoningEngine:

    def analyze(self, incident: Incident):

        if incident.cpu > 90 and incident.packet_loss > 5:
            return {
                "incident": "High Network Congestion",
                "cause": "CPU overload caused by heavy traffic",
                "impact": "Medium",
                "recommendation": "Inspect high traffic interfaces",
                "confidence": 92
            }

        if incident.interface_errors > 100:
            return {
                "incident": "Interface Errors",
                "cause": "Possible cable or SFP issue",
                "impact": "High",
                "recommendation": "Inspect physical interface",
                "confidence": 95
            }

        return {
            "incident": "Healthy",
            "cause": "No abnormal behaviour detected",
            "impact": "Low",
            "recommendation": "No action required",
            "confidence": 99
        }