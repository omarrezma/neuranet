import pandas as pd

from app.ai.loader import (
    scaler,
    kbest,
    rfe,
    feature_columns,
    categorical_encoders,
)


class Preprocessor:

    @staticmethod
    def transform(features: dict):
        """
        Convert extracted flow features into the
        exact format expected by the CNN-LSTM model.
        """

        df = pd.DataFrame([features])

        # Encode categorical features
        for column in ("protocol_type", "service", "flag"):

            encoder = categorical_encoders[column]

            value = str(df.at[0, column])

            if value not in encoder.classes_:
                value = encoder.classes_[0]

            df.at[0, column] = encoder.transform([value])[0]

        # Ensure feature order matches training
        df = df.reindex(columns=feature_columns, fill_value=0)

        # Scaling
        X = scaler.transform(df)

        # Feature Selection
        X = kbest.transform(X)
        X = rfe.transform(X)

        return X