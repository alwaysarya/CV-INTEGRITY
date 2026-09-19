"""
Risk Calibrator - Calibrated risk & confidence scores for drift analysis.
Distinguishes operational drift from suspicious manipulation.
"""

import json
from pathlib import Path
from datetime import datetime, timedelta


class RiskCalibrator:
    """Calibrate drift risk scores with confidence levels."""
    
    # Calibration thresholds
    THRESHOLDS = {
        'stable': {'min': 0, 'max': 5, 'confidence': 0.95, 'action': 'ACCEPT'},
        'minor': {'min': 5, 'max': 10, 'confidence': 0.85, 'action': 'MONITOR'},
        'moderate': {'min': 10, 'max': 20, 'confidence': 0.75, 'action': 'REVIEW'},
        'severe': {'min': 20, 'max': 50, 'confidence': 0.90, 'action': 'QUARANTINE'},
        'critical': {'min': 50, 'max': 100, 'confidence': 0.95, 'action': 'QUARANTINE'},
    }
    
    @staticmethod
    def calibrate_drift(drift_percent, history=None):
        """
        Calibrate drift percent into risk score with confidence.
        
        Args:
            drift_percent: Observed drift (0-100)
            history: List of previous drift values for pattern analysis
        
        Returns:
            dict with calibrated risk, confidence, and interpretation
        """
        drift = abs(drift_percent)
        
        # Determine severity level
        if drift < 5:
            level = 'stable'
        elif drift < 10:
            level = 'minor'
        elif drift < 20:
            level = 'moderate'
        elif drift < 50:
            level = 'severe'
        else:
            level = 'critical'
        
        config = RiskCalibrator.THRESHOLDS[level]
        base_confidence = config['confidence']
        
        # Pattern analysis (if history available)
        pattern_type = 'UNKNOWN'
        pattern_confidence = 0.5
        
        if history and len(history) >= 3:
            pattern_type, pattern_confidence = RiskCalibrator._analyze_pattern(history)
        
        # Final calibrated confidence
        final_confidence = round((base_confidence + pattern_confidence) / 2, 2)
        
        # Calibrated risk score (0-100)
        calibrated_risk = min(drift * 1.0, 100)
        
        return {
            'raw_drift_percent': round(drift, 2),
            'calibrated_risk_score': round(calibrated_risk, 2),
            'confidence': final_confidence,
            'confidence_percent': round(final_confidence * 100, 1),
            'level': level.upper(),
            'action': config['action'],
            'pattern_type': pattern_type,
            'interpretation': RiskCalibrator._interpret(level, pattern_type),
        }
    
    @staticmethod
    def _analyze_pattern(history):
        """Analyze drift history for pattern classification."""
        if len(history) < 3:
            return 'UNKNOWN', 0.5
        
        # Check if monotonic (consistent increase/decrease)
        diffs = [history[i+1] - history[i] for i in range(len(history)-1)]
        
        # Sudden spike check
        max_diff = max(abs(d) for d in diffs)
        avg_diff = sum(abs(d) for d in diffs) / len(diffs)
        
        if max_diff > 3 * avg_diff and max_diff > 10:
            # Sudden spike → likely manipulation
            return 'SUDDEN_SPIKE', 0.85
        
        # Monotonic increase → gradual drift
        if all(d >= 0 for d in diffs) or all(d <= 0 for d in diffs):
            return 'GRADUAL_DRIFT', 0.80
        
        # Fluctuating → environmental
        return 'FLUCTUATING', 0.70
    
    @staticmethod
    def _interpret(level, pattern_type):
        """Human-readable interpretation."""
        if level == 'stable':
            return "Model performance is stable — no action needed"
        elif level == 'minor':
            return "Minor drift detected — continue monitoring"
        elif level == 'moderate':
            return "Moderate drift detected — investigate cause"
        elif level == 'severe':
            if pattern_type == 'SUDDEN_SPIKE':
                return "Severe drift with sudden spike — possible manipulation"
            return "Severe drift — likely operational change, review required"
        else:  # critical
            if pattern_type == 'SUDDEN_SPIKE':
                return "CRITICAL: Sudden spike indicates attack — quarantine"
            return "CRITICAL: Significant drift — quarantine immediately"
    
    @staticmethod
    def calibrate_from_report(report):
        """Calibrate from a drift report JSON."""
        drift_percent = report.get('max_drift_percent', 0)
        return RiskCalibrator.calibrate_drift(drift_percent)
    
    @staticmethod
    def get_calibration_table():
        """Return calibration threshold table."""
        return [
            {
                'level': level.upper(),
                'range': f"{config['min']}-{config['max']}%",
                'confidence': f"{config['confidence']*100:.0f}%",
                'action': config['action'],
            }
            for level, config in RiskCalibrator.THRESHOLDS.items()
        ]


if __name__ == '__main__':
    # Test
    calibrator = RiskCalibrator()
    
    print("=== CALIBRATION TABLE ===")
    for row in calibrator.get_calibration_table():
        print(f"  {row['level']:10} {row['range']:15} conf={row['confidence']} → {row['action']}")
    
    print("\n=== TEST CASES ===")
    for drift in [0, 3, 7, 15, 30, 60]:
        result = calibrator.calibrate_drift(drift)
        print(f"  Drift {drift}%: risk={result['calibrated_risk_score']}, conf={result['confidence']}, action={result['action']}")
