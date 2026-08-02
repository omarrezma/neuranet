from app.ai.predictor import Predictor


def predict(data: dict):
    """
    Wrapper around the Predictor class.
    Returns:
        {
            "prediction": "Attack" | "Normal",
            "confidence": float,
            "probability": float
        }
    """
    return Predictor.predict(data)