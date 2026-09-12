"""
Model Drift Detection
Detect when model performance degrades over time
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from pathlib import Path
from datetime import datetime


class ModelDriftDetector:
    """Detect model performance drift"""
    
    def __init__(self):
        self.history_dir = Path('outputs/model_history')
        self.history_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir = Path('outputs/reports')
        
        # Drift thresholds
        self.thresholds = {
            'critical': -15.0,    # 15% drop = critical
            'warning': -7.5,      # 7.5% drop = warning
            'minor': -2.5         # 2.5% drop = minor
        }
    
    def save_snapshot(self, model_name, metrics):
        """Save model metrics snapshot for history"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        snapshot = {
            'model_name': model_name,
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics
        }
        
        # Save individual snapshot
        snapshot_file = self.history_dir / f"{model_name}_{timestamp}.json"
        with open(snapshot_file, 'w') as f:
            json.dump(snapshot, f, indent=2)
        
        # Update baseline (first snapshot)
        baseline_file = self.history_dir / f"{model_name}_baseline.json"
        if not baseline_file.exists():
            with open(baseline_file, 'w') as f:
                json.dump(snapshot, f, indent=2)
        
        return str(snapshot_file)
    
    def get_baseline(self, model_name):
        """Get baseline metrics for a model"""
        baseline_file = self.history_dir / f"{model_name}_baseline.json"
        
        if baseline_file.exists():
            with open(baseline_file, 'r') as f:
                return json.load(f)
        return None
    
    def get_history(self, model_name, limit=10):
        """Get historical snapshots"""
        snapshots = sorted(
            self.history_dir.glob(f"{model_name}_*.json"),
            key=lambda x: x.stat().st_mtime,
            reverse=True
        )
        
        # Filter out baseline
        snapshots = [s for s in snapshots if 'baseline' not in s.name]
        
        history = []
        for snapshot_file in snapshots[:limit]:
            with open(snapshot_file, 'r') as f:
                history.append(json.load(f))
        
        return history
    
    def detect_drift(self, model_name, current_metrics):
        """
        Detect drift by comparing current metrics with baseline
        
        Args:
            model_name: Name of model
            current_metrics: Current performance metrics
        
        Returns:
            dict with drift analysis
        """
        baseline = self.get_baseline(model_name)
        
        if not baseline:
            # No baseline yet, save as baseline
            self.save_snapshot(model_name, current_metrics)
            return {
                'status': 'baseline_created',
                'message': 'Baseline created for future comparison',
                'model': model_name,
                'drift_detected': False
            }
        
        baseline_metrics = baseline.get('metrics', {})
        
        # Calculate drift for each metric
        drifts = {}
        max_drift = 0
        drift_metric = None
        
        for metric in ['mAP50', 'precision', 'recall']:
            if metric in baseline_metrics and metric in current_metrics:
                baseline_value = baseline_metrics[metric]
                current_value = current_metrics[metric]
                
                # Calculate percentage change
                if baseline_value > 0:
                    change_percent = ((current_value - baseline_value) / baseline_value) * 100
                else:
                    change_percent = 0
                
                drifts[metric] = {
                    'baseline': baseline_value,
                    'current': current_value,
                    'change_percent': round(change_percent, 2)
                }
                
                # Track worst drift
                if change_percent < max_drift:
                    max_drift = change_percent
                    drift_metric = metric
        
        # Determine severity
        if max_drift <= self.thresholds['critical']:
            severity = 'CRITICAL'
            color = '#FF4757'
            action = 'Retraining strongly recommended!'
        elif max_drift <= self.thresholds['warning']:
            severity = 'WARNING'
            color = '#FFB84D'
            action = 'Monitor closely, retraining may be needed'
        elif max_drift <= self.thresholds['minor']:
            severity = 'MINOR'
            color = '#5B8DEF'
            action = 'Minor drift, continue monitoring'
        else:
            severity = 'STABLE'
            color = '#00D9A3'
            action = 'Model performance is stable'
        
        drift_detected = max_drift < self.thresholds['minor']
        
        result = {
            'status': 'analyzed',
            'model': model_name,
            'drift_detected': drift_detected,
            'severity': severity,
            'color': color,
            'action': action,
            'max_drift_percent': round(max_drift, 2),
            'drift_metric': drift_metric,
            'metric_drifts': drifts,
            'baseline_timestamp': baseline.get('timestamp'),
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        # Save snapshot
        self.save_snapshot(model_name, current_metrics)
        
        # Save drift report
        report_file = self.reports_dir / f"drift_{model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        return result
    
    def get_all_drift_reports(self):
        """Get all drift reports"""
        reports = []
        
        for report_file in sorted(self.reports_dir.glob("drift_*.json"), 
                                  key=lambda x: x.stat().st_mtime, reverse=True):
            with open(report_file, 'r') as f:
                reports.append(json.load(f))
        
        return reports
    
    def get_model_status(self):
        """Get status of all models"""
        status = {}
        
        # Load current metrics
        model_data_path = Path('model/saved_models/all_training_results.json')
        if model_data_path.exists():
            with open(model_data_path, 'r') as f:
                all_results = json.load(f)
            
            for model_name, info in all_results.items():
                metrics = info.get('metrics', {})
                
                # Convert to percentage
                current_metrics = {
                    'mAP50': metrics.get('mAP50', 0) * 100,
                    'precision': metrics.get('precision', 0) * 100,
                    'recall': metrics.get('recall', 0) * 100
                }
                
                drift = self.detect_drift(model_name, current_metrics)
                status[model_name] = drift
        
        return status


if __name__ == "__main__":
    print("\n" + "="*60)
    print("📈 MODEL DRIFT DETECTION")
    print("="*60 + "\n")
    
    detector = ModelDriftDetector()
    
    print("🔍 Analyzing model drift...\n")
    
    status = detector.get_model_status()
    
    if not status:
        print("⚠️ No model data found")
        print("   Run training first: python3 scripts/train_fast.py")
    else:
        for model_name, result in status.items():
            print(f"📊 {model_name.upper()}:")
            print(f"   Status: {result.get('status', 'N/A')}")
            
            if result.get('status') == 'baseline_created':
                print(f"   ✅ {result.get('message')}")
            else:
                print(f"   Severity: {result.get('severity', 'N/A')}")
                print(f"   Drift: {result.get('max_drift_percent', 0)}%")
                print(f"   Action: {result.get('action', 'N/A')}")
                
                if result.get('metric_drifts'):
                    print(f"   Metrics:")
                    for metric, values in result['metric_drifts'].items():
                        print(f"      • {metric}: {values['baseline']:.1f}% → {values['current']:.1f}% ({values['change_percent']:+.1f}%)")
            print()
    
    print("="*60)
    print("✅ Drift detection complete!")
    print("="*60)