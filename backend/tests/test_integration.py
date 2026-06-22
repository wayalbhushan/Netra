import sys
import os
import unittest
from datetime import datetime

# Adjust path to import app package
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.models.telemetry import TelemetryFrame, SSIClaimVerificationRequest
from app.blockchain.did import verify_zkp_credential
from app.services.anomaly import anomaly_detector_service
from app.api.websockets import check_geofence_breach

class TestBackendIntegration(unittest.TestCase):
    def test_did_zkp_verification(self):
        """
        Verify that placeholder 'Bhushan Wayal' resolves and verifies successfully.
        """
        request = SSIClaimVerificationRequest(
            did="did:netra:polygon:0xBhushanWayal",
            credential_type="TouristSafetyAccreditation"
        )
        response = verify_zkp_credential(request)
        self.assertTrue(response.verified)
        self.assertEqual(response.subject_name, "Bhushan Wayal")
        self.assertTrue(response.zkp_proof_valid)
        self.assertTrue(response.blockchain_block > 0)
        
        # Test generic fallback DID resolves to a mock tourist
        fallback_request = SSIClaimVerificationRequest(
            did="did:netra:polygon:0xSomeOtherUser",
            credential_type="TouristSafetyAccreditation"
        )
        fallback_response = verify_zkp_credential(fallback_request)
        self.assertTrue(fallback_response.verified)
        self.assertIn("Registered Tourist", fallback_response.subject_name)

    def test_geofencing_alert(self):
        """
        Test geofence breach logic triggers correctly outside of Pune city core radius.
        """
        # Close to center: 18.5204° N, 73.8567° E
        near_breach = check_geofence_breach(18.5205, 73.8568)
        self.assertIsNone(near_breach)
        
        # Further out (breach boundary)
        far_breach = check_geofence_breach(18.5400, 73.8700)
        self.assertIsNotNone(far_breach)
        self.assertIn("GEOFENCE BREACH", far_breach)

    def test_anomaly_scoring_and_threat_taxonomy(self):
        """
        Test that IsolationForest model evaluates telemetry frames and flags anomalies.
        """
        # Ensure model is initialized
        self.assertIsNotNone(anomaly_detector_service.model)
        
        # Normal frame profile: within Pune range, walking speed, high battery, strong network
        normal_frame = TelemetryFrame(
            did="did:netra:polygon:0xBhushanWayal",
            latitude=18.5204,
            longitude=73.8567,
            speed=1.2,
            battery=85.0,
            rssi=-50.0,
            timestamp=datetime.utcnow().isoformat(),
            surrounding_tourist_count=4
        )
        
        safety_score, anomaly_detected, anomaly_type = anomaly_detector_service.score_telemetry(normal_frame)
        self.assertFalse(anomaly_detected)
        self.assertGreater(safety_score, 0.50)
        self.assertIsNone(anomaly_type)

        # Outlier profile: Critical low battery
        low_battery_frame = TelemetryFrame(
            did="did:netra:polygon:0xBhushanWayal",
            latitude=18.5204,
            longitude=73.8567,
            speed=1.2,
            battery=8.0, # < 15
            rssi=-50.0,
            timestamp=datetime.utcnow().isoformat(),
            surrounding_tourist_count=4
        )
        _, low_bat_anomaly, low_bat_type = anomaly_detector_service.score_telemetry(low_battery_frame)
        self.assertTrue(low_bat_anomaly)
        self.assertEqual(low_bat_type, "CRITICAL BATTERY LEVEL")

        # Outlier profile: Signal loss
        no_signal_frame = TelemetryFrame(
            did="did:netra:polygon:0xBhushanWayal",
            latitude=18.5204,
            longitude=73.8567,
            speed=1.2,
            battery=85.0,
            rssi=-120.0, # < -110
            timestamp=datetime.utcnow().isoformat(),
            surrounding_tourist_count=4
        )
        _, no_sig_anomaly, no_sig_type = anomaly_detector_service.score_telemetry(no_signal_frame)
        self.assertTrue(no_sig_anomaly)
        self.assertEqual(no_sig_type, "COMMUNICATION SIGNAL LOSS")

if __name__ == "__main__":
    unittest.main()
