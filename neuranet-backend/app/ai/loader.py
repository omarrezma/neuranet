from pathlib import Path
import joblib
from tensorflow.keras.models import load_model

from app.logging_config import get_logger

logger = get_logger(__name__)

# ==========================================================
# Models directory
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

# ==========================================================
# Load CNN-LSTM Model
# ==========================================================

model = load_model(
    MODEL_DIR / "model.h5",
    compile=False
)

# ==========================================================
# Load Artifacts
# ==========================================================

scaler = joblib.load(
    MODEL_DIR / "scaler.pkl"
)

kbest = joblib.load(
    MODEL_DIR / "kbest.pkl"
)

rfe = joblib.load(
    MODEL_DIR / "rfe.pkl"
)

feature_columns = joblib.load(
    MODEL_DIR / "feature_columns.pkl"
)

selected_features = joblib.load(
    MODEL_DIR / "selected_features.pkl"
)

categorical_encoders = joblib.load(
    MODEL_DIR / "categorical_encoders.pkl"
)

label_encoder = joblib.load(
    MODEL_DIR / "label_encoder.pkl"
)

# ==========================================================
# Categorical Columns
# ==========================================================

categorical_columns = [
    "protocol_type",
    "service",
    "flag"
]

logger.info("CNN-LSTM model loaded successfully")
logger.info("Total Features : %d", len(feature_columns))
logger.info("Selected Features : %d", len(selected_features))