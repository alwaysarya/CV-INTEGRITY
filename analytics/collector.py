"""
Analytics Data Collector
Aggregates data from all modules for analytics dashboard
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict


class AnalyticsCollector:
    """Collects and aggregates analytics data"""
    
    def __init__(self):
        self.base = Path(__file__).parent.parent
        self.reports_dir = self.base / "outputs" / "reports"
        self.outputs_dir = self.base / "outputs"
        self.models_dir = self.base / "model" / "saved_models"
    
    def load_json(self, path):
        """Load JSON file safely"""
        if path.exists():
            try:
                with open(path, 'r') as f:
                    return json.load(f)
            except:
                return None
        return None
    
    def collect_training_metrics(self):
        """Collect training metrics for all models"""
        metrics = {}
        models_path = self.models_dir / "all_training_results.json"
        
        data = self.load_json(models_path)
        if data:
            for model_name, info in data.items():
                m = info.get('metrics', {})
                metrics[model_name] = {
                    'precision': round(m.get('precision', 0) * 100, 2),
                    'recall': round(m.get('recall', 0) * 100, 2),
                    'mAP50': round(m.get('mAP50', 0) * 100, 2),
                    'mAP50_95': round(m.get('mAP50_95', 0) * 100, 2),
                    'epochs': info.get('epochs', 0)
                }
        
        return metrics
    
    def collect_dataset_quality(self):
        """Collect dataset quality metrics"""
        quality = {}
        
        for ds in ['good', 'bad', 'worst']:
            data = self.load_json(self.reports_dir / f'{ds}_quality_report.json')
            if data:
                scores = data.get('scores', {})
                quality[ds] = {
                    'overall': scores.get('overall_score', 0),
                    'blur': scores.get('blur_score', 0),
                    'duplicate': scores.get('duplicate_score', 0),
                    'noise': scores.get('noise_score', 0),
                    'total_images': data.get('total_images', 0)
                }
        
        return quality
    
    def collect_trust_scores(self):
        """Collect trust scores"""
        data = self.load_json(self.reports_dir / 'final_trust_report.json')
        
        if data:
            scores = {}
            for ds, info in data.items():
                scores[ds] = {
                    'score': info.get('final_score', 0),
                    'decision': info.get('decision', 'N/A'),
                    'components': info.get('components', {})
                }
            return scores
        
        return {}
    
    def collect_blockchain_stats(self):
        """Collect blockchain statistics"""
        data = self.load_json(self.reports_dir / 'blockchain.json')
        
        if data:
            chain = data.get('chain', [])
            
            # Count block types
            block_types = defaultdict(int)
            for block in chain:
                block_data = block.get('data', {})
                block_type = block_data.get('action', block_data.get('type', 'unknown'))
                block_types[block_type] += 1
            
            return {
                'total_blocks': data.get('length', 0),
                'is_valid': data.get('is_valid', False),
                'difficulty': data.get('difficulty', 2),
                'block_types': dict(block_types)
            }
        
        return {}
    
    def collect_attack_stats(self):
        """Collect cyber attack statistics"""
        data = self.load_json(self.reports_dir / 'cyber_attacks.json')
        
        if data:
            attacks = data.get('attacks', [])
            
            by_severity = defaultdict(int)
            for attack in attacks:
                severity = attack.get('severity', 'UNKNOWN')
                by_severity[severity] += 1
            
            return {
                'total_attacks': data.get('total_attacks', 0),
                'detected': data.get('detected', 0),
                'detection_rate': data.get('detection_rate', 0),
                'by_severity': dict(by_severity)
            }
        
        return {}
    
    def collect_wallet_stats(self):
        """Collect wallet statistics"""
        data = self.load_json(self.reports_dir / 'wallets.json')
        
        if data:
            wallets = data.get('wallets', {})
            
            balances = [w.get('balance', 0) for w in wallets.values()]
            total_circulating = sum(balances)
            
            return {
                'token_name': data.get('token_name', 'CVIT'),
                'total_supply': data.get('total_supply', 1000000),
                'circulating': total_circulating,
                'total_wallets': len(wallets),
                'top_holders': sorted(
                    [(name, w.get('balance', 0)) for name, w in wallets.items()],
                    key=lambda x: x[1],
                    reverse=True
                )[:5]
            }
        
        return {}
    
    def collect_robustness_data(self):
        """Collect robustness testing data"""
        data = self.load_json(self.reports_dir / 'robustness_results.json')
        
        if data:
            results = {}
            for model, info in data.items():
                results[model] = {
                    'average': round(info.get('average_robustness', 0), 2),
                    'min': round(info.get('min_robustness', 0), 2),
                    'max': round(info.get('max_robustness', 0), 2)
                }
            return results
        
        return {}
    
    def collect_drift_data(self):
        """Collect model drift data"""
        reports = []
        
        if self.reports_dir.exists():
            for report_file in sorted(self.reports_dir.glob("drift_*.json"), 
                                     key=lambda x: x.stat().st_mtime, reverse=True)[:10]:
                data = self.load_json(report_file)
                if data:
                    reports.append({
                        'model': data.get('model', 'unknown'),
                        'severity': data.get('severity', 'N/A'),
                        'drift_percent': data.get('max_drift_percent', 0),
                        'timestamp': data.get('analysis_timestamp', '')
                    })
        
        return reports
    
    def collect_all(self):
        """Collect all analytics data"""
        return {
            'collected_at': datetime.now().isoformat(),
            'training_metrics': self.collect_training_metrics(),
            'dataset_quality': self.collect_dataset_quality(),
            'trust_scores': self.collect_trust_scores(),
            'blockchain_stats': self.collect_blockchain_stats(),
            'attack_stats': self.collect_attack_stats(),
            'wallet_stats': self.collect_wallet_stats(),
            'robustness_data': self.collect_robustness_data(),
            'drift_data': self.collect_drift_data()
        }
    
    def save_analytics(self):
        """Save collected analytics"""
        data = self.collect_all()
        
        output_path = self.reports_dir / 'analytics_summary.json'
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return data, str(output_path)
    
    def get_summary_stats(self):
        """Get high-level summary statistics"""
        data = self.collect_all()
        
        # Calculate summary
        training = data.get('training_metrics', {})
        quality = data.get('dataset_quality', {})
        trust = data.get('trust_scores', {})
        blockchain = data.get('blockchain_stats', {})
        attacks = data.get('attack_stats', {})
        wallets = data.get('wallet_stats', {})
        
        avg_map50 = 0
        if training:
            avg_map50 = sum(m.get('mAP50', 0) for m in training.values()) / len(training)
        
        avg_quality = 0
        if quality:
            avg_quality = sum(q.get('overall', 0) for q in quality.values()) / len(quality)
        
        avg_trust = 0
        if trust:
            avg_trust = sum(t.get('score', 0) for t in trust.values()) / len(trust)
        
        return {
            'avg_mAP50': round(avg_map50, 2),
            'avg_dataset_quality': round(avg_quality, 2),
            'avg_trust_score': round(avg_trust, 2),
            'total_blocks': blockchain.get('total_blocks', 0),
            'detection_rate': attacks.get('detection_rate', 0),
            'total_wallets': wallets.get('total_wallets', 0),
            'circulating_tokens': wallets.get('circulating', 0)
        }


if __name__ == "__main__":
    print("\n" + "="*60)
    print("📊 ANALYTICS DATA COLLECTOR")
    print("="*60 + "\n")
    
    collector = AnalyticsCollector()
    
    print("🔄 Collecting analytics data...\n")
    
    data, output_path = collector.save_analytics()
    
    print("✅ Data collected:")
    print(f"   📈 Training metrics: {len(data['training_metrics'])} models")
    print(f"   📊 Dataset quality: {len(data['dataset_quality'])} datasets")
    print(f"   🧠 Trust scores: {len(data['trust_scores'])} datasets")
    print(f"   🔗 Blockchain: {data['blockchain_stats'].get('total_blocks', 0)} blocks")
    print(f"   🛡️ Attacks: {data['attack_stats'].get('detected', 0)}/{data['attack_stats'].get('total_attacks', 0)} detected")
    print(f"   💰 Wallets: {data['wallet_stats'].get('total_wallets', 0)}")
    print(f"   🧪 Robustness: {len(data['robustness_data'])} models")
    print(f"   📈 Drift reports: {len(data['drift_data'])}")
    
    print(f"\n💾 Saved to: {output_path}")
    
    print("\n" + "="*60)
    print("📊 SUMMARY STATISTICS")
    print("="*60)
    
    summary = collector.get_summary_stats()
    for key, value in summary.items():
        print(f"   {key.replace('_', ' ').title()}: {value}")
    
    print("\n" + "="*60)
    print("✅ Analytics collector ready!")
    print("="*60)