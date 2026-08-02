import numpy as np
import pandas as pd

from .loader import (
    model,
    scaler,
    kbest,
    rfe,
    feature_columns,
    categorical_columns,
    categorical_encoders,
)

FEATURE_COLUMNS = feature_columns
CATEGORICAL_COLUMNS = categorical_columns

SCALER = scaler
KBEST = kbest
RFE = rfe


class Predictor:

    @staticmethod
    def predict(data: dict, threshold: float = 0.30):

        # Create DataFrame
        df = pd.DataFrame([data])

        # Ensure every required feature exists
        for col in FEATURE_COLUMNS:
            if col not in df.columns:
                df[col] = 0

        # Correct feature order
        df = df[FEATURE_COLUMNS]

        # Encode categorical features
        for col in CATEGORICAL_COLUMNS:

            encoder = categorical_encoders[col]

            value = str(df.at[0, col])

            if value not in encoder.classes_:

                defaults = {
                    "protocol_type": "tcp",
                    "service": "private",
                    "flag": "SF",
                }

                fallback = defaults.get(col, encoder.classes_[0])

                if fallback in encoder.classes_:
                    value = fallback
                else:
                    value = encoder.classes_[0]

            df[col] = encoder.transform([value])[0]

        # Convert all values to float
        df = df.astype(float)

        # Scale
        x = SCALER.transform(df)

        # Feature Selection
        x = KBEST.transform(x)
        x = RFE.transform(x)

        # CNN-LSTM input
        x = x.astype(np.float32)
        x = x.reshape((1, x.shape[1], 1))

        # Predict
        probability = float(model.predict(x, verbose=0)[0][0])

        prediction = (
            "Attack"
            if probability >= threshold
            else "Normal"
        )

        confidence = (
            probability * 100
            if prediction == "Attack"
            else (1.0 - probability) * 100
        )

        return {
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "probability": round(probability, 4),
        }