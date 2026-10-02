"""
Model Fingerprinting - Behavioral signature generation.
Compares against reference battery for substitution detection.
"""

import hashlib
import json
from pathlib import Path
from datetime import datetime


class ModelFingerprinter:
    """Generate and compare behavioral fingerprints."""
    
    def __init__(self, history_dir='outputs/model_history'):
        self.history_dir = Path(history_dir)
    
    @staticmethod
    def generate_fingerprint(model_name, metrics, file_hash=None):
        """
        Generate behavioral fingerprint from model metrics.
        
        Args:
            model_name: Name of model (good/bad/worst)
            metrics: dict with mAP50, precision, recall
            file_hash: Optional SHA-256 of model file
        
        Returns:
            SHA-256 fingerprint hash
        """
        # Normalize metrics
        fingerprint_data = {
            'model_name': model_name,
            'mAP50': round(metrics.get('mAP50', 0), 4),
            'precision': round(metrics.get('precision', 0), 4),
            'recall': round(metrics.get('recall', 0), 4),
            'file_hash': file_hash or 'N/A',
        }
        
        # Generate fingerprint
        data_str = json.dumps(fingerprint_data, sort_keys=True)
        fingerprint = hashlib.sha256(data_str.encode()).hexdigest()
        
        return {
            'fingerprint': fingerprint,
            'components': fingerprint_data,
            'generated_at': datetime.utcnow().isoformat(),
        }
    
    def load_baseline(self, model_name):
        """Load baseline metrics for model."""
        baseline_file = self.history_dir / f'{model_name}_baseline.json'
        if not baseline_file.exists():
            return None
        
        try:
            with open(baseline_file) as f:
                return json.load(f)
        except:
            return None
    
    def compare_with_baseline(self, model_name, current_metrics):
        """
        Compare current fingerprint with baseline.
        
        Returns:
            dict with match status, confidence, differences
        """
        baseline = self.load_baseline(model_name)
        if not baseline:
            return {
                'status': 'NO_BASELINE',
                'confidence': 0.0,
                'message': 'No baseline available for comparison',
            }
        
        baseline_metrics = baseline.get('metrics', {})
        
        # Generate both fingerprints
        baseline_fp = self.generate_fingerprint(model_name, baseline_metrics)
        current_fp = self.generate_fingerprint(model_name, current_metrics)
        
        # Calculate differences
        differences = {}
        max_diff = 0
        
        for metric in ['mAP50', 'precision', 'recall']:
            baseline_val = baseline_metrics.get(metric, 0)
            current_val = current_metrics.get(metric, 0)
            
            if baseline_val > 0:
                diff_pct = abs(current_val - baseline_val) / baseline_val * 100
            else:
                diff_pct = abs(current_val) * 100
            
            differences[metric] = {
                'baseline': round(baseline_val, 4),
                'current': round(current_val, 4),
                'diff_percent': round(diff_pct, 2),
            }
            
            max_diff = max(max_diff, diff_pct)
        
        # Determine confidence based on max difference
        if max_diff < 1:
            confidence = 1.0
            status = 'IDENTICAL'
        elif max_diff < 5:
            confidence = 0.95
            status = 'MATCHING'
        elif max_diff < 15:
            confidence = 0.75
            status = 'MINOR_DRIFT'
        elif max_diff < 30:
            confidence = 0.50
            status = 'SIGNIFICANT_DRIFT'
        else:
            confidence = 0.25
            status = 'SUBSTITUTED'
        
        return {
            'status': status,
            'confidence': confidence,
            'confidence_percent': round(confidence * 100, 1),
            'max_diff_percent': round(max_diff, 2),
            'baseline_fingerprint': baseline_fp['fingerprint'],
            'current_fingerprint': current_fp['fingerprint'],
            'fingerprint_match': baseline_fp['fingerprint'] == current_fp['fingerprint'],
            'differences': differences,
            'message': self._status_message(status, max_diff),
        }
    
    @staticmethod
    def _status_message(status, diff):
        """Human-readable status message."""
        if status == 'IDENTICAL':
            return "Model matches reference exactly — VERIFIED"
        elif status == 'MATCHING':
            return f"Model closely matches reference (diff: {diff:.1f}%) — VERIFIED"
        elif status == 'MINOR_DRIFT':
            return f"Minor drift from reference (diff: {diff:.1f}%) — MONITOR"
        elif status == 'SIGNIFICANT_DRIFT':
            return f"Significant drift from reference (diff: {diff:.1f}%) — REVIEW"
        else:
            return f"Model may be SUBSTITUTED (diff: {diff:.1f}%) — QUARANTINE"
    
    def get_all_fingerprints(self):
        """Get fingerprints for all models with baselines."""
        fingerprints = []
        
        for baseline_file in self.history_dir.glob('*_baseline.json'):
            model_name = baseline_file.stem.replace('_baseline', '')
            baseline = self.load_baseline(model_name)
            
            if baseline:
                fp = self.generate_fingerprint(model_name, baseline.get('metrics', {}))
                fp['model_name'] = model_name
                fingerprints.append(fp)
        
        return fingerprints


if __name__ == '__main__':
    fp = ModelFingerprinter()
    
    print("=== MODEL FINGERPRINTS ===")
    for f in fp.get_all_fingerprints():
        print(f"\n{f['model_name'].upper()}:")
        print(f"  Fingerprint: {f['fingerprint'][:32]}...")
        print(f"  Metrics: {f['components']}")
    
    print("\n=== COMPARISON TEST ===")
    # Test with same metrics (should match)
    baseline = fp.load_baseline('good')
    if baseline:
        result = fp.compare_with_baseline('good', baseline.get('metrics', {}))
        print(f"Same metrics: {result['status']} (confidence: {result['confidence']})")
    
    # Test with different metrics (should detect)
    different = {'mAP50': 10.0, 'precision': 30.0, 'recall': 10.0}
    result = fp.compare_with_baseline('good', different)
    print(f"Different metrics: {result['status']} (confidence: {result['confidence']})")
