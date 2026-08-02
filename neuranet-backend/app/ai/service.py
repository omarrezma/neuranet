from sqlalchemy.orm import Session

from .predictor import Predictor
from .history import AIHistory

from app.models.ai_prediction import AIPrediction
from app.models.settings import Settings


class AIService:

    @staticmethod
    def predict(data: dict, db: Session):

        settings = db.query(Settings).first()

        threshold = 0.30
        auto_detect = True
        auto_save = True

        if settings:
            threshold = settings.confidence_threshold
            auto_detect = settings.auto_detect
            auto_save = settings.auto_save_alerts

        # Detection disabled
        if not auto_detect:
            return {
                "prediction": "Detection Disabled",
                "confidence": 0,
                "probability": 0,
            }

        result = Predictor.predict(
            data=data,
            threshold=threshold,
        )

        if auto_save:

            prediction = AIPrediction(
                prediction=result["prediction"],
                confidence=result["confidence"],
            )

            db.add(prediction)
            db.commit()
            db.refresh(prediction)

        return result

    @staticmethod
    def history(db: Session):
        return AIHistory.get_all(db)