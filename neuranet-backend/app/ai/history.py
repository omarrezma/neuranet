from sqlalchemy.orm import Session 

from app.models.ai_prediction import AIPrediction


class AIHistory:

    @staticmethod
    def get_all(db: Session):

        return (
            db.query(AIPrediction)
            .order_by(AIPrediction.created_at.desc())
            .all()
        )