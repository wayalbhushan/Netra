import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import Tuple, Optional
from app.models.telemetry import TelemetryFrame

MODEL_PATH = os.path.join(os.path.dirname(__file__), "isolation_forest.pkl")

class AnomalyDetector:
    def __init__(self):
        self.model: Optional[IsolationForest] = None
        self.scaler_min = None
        self.scaler_max = None
        self.load_or_train()

    def generate_synthetic_normal_data(self, n_samples: int = 500) -> pd.DataFrame:
        """
        Generates synthetic telemetry representing safe, normal tourist activity.
        This provides a base profile for the Isolation Forest to model.
        """
        np.random.seed(42)
        # Pune, India coordinates as base (matching page.tsx: 18.5204° N, 73.8567° E)
        base_lat, base_lon = 18.5204, 73.8567
        
        # Safe profiles:
        # 1. Close to center, slow speeds (walking), high battery, normal signal, surrounded by people
        lats = base_lat + np.random.normal(0, 0.005, n_samples)
        lons = base_lon + np.random.normal(0, 0.005, n_samples)
        speeds = np.random.normal(1.2, 0.4, n_samples)  # Walking speed ~1.2 m/s
        speeds = np.clip(speeds, 0.1, 5.0)
        
        batteries = np.random.uniform(20, 100, n_samples)
        rssis = np.random.uniform(-90, -40, n_samples)      # Normal signal dBm
        tourist_counts = np.random.randint(1, 12, n_samples) # Usually with people
        
        return pd.DataFrame({
            "latitude": lats,
            "longitude": lons,
            "speed": speeds,
            "battery": batteries,
            "rssi": rssis,
            "surrounding_tourist_count": tourist_counts
        })

    def train_baseline_model(self):
        """
        Trains a new Isolation Forest model on normal profiles.
        """
        df = self.generate_synthetic_normal_data()
        X = df.values
        
        # Fit Isolation Forest
        # contamination = 0.05 means 5% of training samples might be considered outliers
        clf = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        clf.fit(X)
        self.model = clf
        
        # Track training boundaries to normalize decision function scores
        scores = clf.decision_function(X)
        self.scaler_min = float(scores.min())
        self.scaler_max = float(scores.max())
        
        # Save model to disk
        with open(MODEL_PATH, "wb") as f:
            pickle.dump({
                "model": clf,
                "scaler_min": self.scaler_min,
                "scaler_max": self.scaler_max
            }, f)
        print("AI // DETECT: IsolationForest model trained on startup and saved to disk.")

    def load_or_train(self):
        """
        Loads the pre-trained model or trains a new one.
        """
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, "rb") as f:
                    data = pickle.load(f)
                    self.model = data["model"]
                    self.scaler_min = data["scaler_min"]
                    self.scaler_max = data["scaler_max"]
                print("AI // DETECT: Loaded existing anomaly model from disk.")
                return
            except Exception as e:
                print(f"AI // DETECT: Error loading model ({e}), retraining...")
        
        self.train_baseline_model()

    def score_telemetry(self, frame: TelemetryFrame) -> Tuple[float, bool, Optional[str]]:
        """
        Scores telemetry frame.
        Returns:
            - safety_score: float (0.0 to 1.0, lower is higher risk)
            - anomaly_detected: bool
            - anomaly_type: Optional[str]
        """
        if not self.model:
            return 1.0, False, None
            
        features = np.array([[
            frame.latitude,
            frame.longitude,
            frame.speed,
            frame.battery,
            frame.rssi,
            frame.surrounding_tourist_count
        ]])
        
        # Get raw prediction (-1 for outlier, 1 for inlier)
        prediction = self.model.predict(features)[0]
        raw_score = float(self.model.decision_function(features)[0])
        
        # Calculate dynamic safety score between 0.0 and 1.0 based on raw decision function boundaries
        # Map raw_score from [scaler_min, scaler_max] to [0.0, 1.0]
        # Low scores represent higher isolation forest anomaly
        span = (self.scaler_max - self.scaler_min) if self.scaler_max != self.scaler_min else 1.0
        safety_score = float(np.clip((raw_score - self.scaler_min) / span, 0.0, 1.0))
        
        anomaly_detected = (prediction == -1)
        anomaly_type = None
        
        # Apply deterministic threat taxonomy filters
        if frame.battery < 15:
            anomaly_detected = True
            safety_score = min(safety_score, 0.25)
            anomaly_type = "CRITICAL BATTERY LEVEL"
        elif frame.rssi < -110:
            anomaly_detected = True
            safety_score = min(safety_score, 0.20)
            anomaly_type = "COMMUNICATION SIGNAL LOSS"
        elif frame.surrounding_tourist_count == 0 and safety_score < 0.45:
            anomaly_detected = True
            anomaly_type = "SOCIAL ISOLATION THREAT"
        elif frame.speed > 25.0: # Exceeding normal vehicle speeds / run away indicators
            anomaly_detected = True
            safety_score = min(safety_score, 0.30)
            anomaly_type = "ABNORMAL VELOCITY EXCEEDED"
        elif anomaly_detected:
            anomaly_type = "UNSUPERVISED SPATIAL RISK"
            
        return safety_score, anomaly_detected, anomaly_type

# Singleton instance
anomaly_detector_service = AnomalyDetector()
