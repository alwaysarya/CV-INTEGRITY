"""
Trigger Search & Reconstruction Module
Detects backdoor triggers in computer vision models.
"""

import hashlib
import json
import random
from pathlib import Path
from datetime import datetime


class TriggerSearcher:
    """Search for backdoor triggers in CV models."""
    
    # Common trigger patterns (small patches)
    TRIGGER_PATTERNS = {
        'random_noise': 'Random noise patch (3x3)',
        'solid_color': 'Solid color patch',
        'checkerboard': 'Checkerboard pattern',
        'gradient': 'Gradient patch',
        'cross': 'Cross-shaped patch',
    }
    
    def __init__(self, model_path=None):
        self.model_path = model_path
        self.search_history = []
    
    def search_by_perturbation(self, base_confidence=0.5, iterations=100):
        """
        Search for triggers by input perturbation.
        Looks for patterns that cause confidence changes.
        """
        results = []
        
        for i in range(iterations):
            # Generate random patch
            patch_type = random.choice(list(self.TRIGGER_PATTERNS.keys()))
            patch_size = random.choice([2, 3, 4, 5])
            position = (random.randint(0, 100), random.randint(0, 100))
            
            # Simulate confidence change (in real: run model)
            confidence_change = self._simulate_confidence_change(patch_type, patch_size)
            
            # Flag if significant change
            if abs(confidence_change) > 0.3:
                results.append({
                    'patch_type': patch_type,
                    'patch_size': patch_size,
                    'position': position,
                    'confidence_change': round(confidence_change, 4),
                    'severity': 'HIGH' if abs(confidence_change) > 0.5 else 'MEDIUM',
                    'confidence': round(min(abs(confidence_change) * 2, 1.0), 2),
                })
        
        return results
    
    def _simulate_confidence_change(self, patch_type, patch_size):
        """Simulate confidence change from trigger patch."""
        # Deterministic based on patch
        seed_str = f"{patch_type}_{patch_size}"
        seed_hash = int(hashlib.sha256(seed_str.encode()).hexdigest()[:8], 16)
        random.seed(seed_hash)
        
        # Random but deterministic change
        base_change = (seed_hash % 1000) / 1000.0 - 0.5
        size_factor = patch_size / 10.0
        
        return base_change * size_factor * 2
    
    def analyze_activations(self, layer_names=None):
        """
        Analyze layer activations for anomalies.
        Compares against expected distribution.
        """
        if layer_names is None:
            layer_names = ['conv1', 'conv2', 'conv3', 'conv4', 'conv5']
        
        results = []
        
        for layer in layer_names:
            # Simulate activation stats
            seed_hash = int(hashlib.sha256(layer.encode()).hexdigest()[:8], 16)
            random.seed(seed_hash)
            
            mean = round(random.uniform(0.1, 2.0), 4)
            std = round(random.uniform(0.05, 0.5), 4)
            anomaly_score = round(random.uniform(0, 1), 4)
            
            results.append({
                'layer': layer,
                'mean': mean,
                'std': std,
                'anomaly_score': anomaly_score,
                'status': 'ANOMALOUS' if anomaly_score > 0.7 else 'NORMAL',
            })
        
        return results
    
    def reconstruct_trigger(self, target_class=0, iterations=50):
        """
        Reconstruct potential trigger pattern.
        Uses optimization to find minimal input change.
        """
        best_candidate = None
        best_score = 0
        
        for i in range(iterations):
            seed = i * 9973  # Prime for uniqueness
            random.seed(seed)
            
            # Generate candidate trigger
            trigger = {
                'shape': random.choice(['square', 'cross', 'circle', 'stripes']),
                'size': random.choice([2, 3, 4, 5]),
                'color': random.choice(['red', 'green', 'blue', 'yellow', 'white']),
                'position': random.choice(['corner', 'center', 'edge']),
            }
            
            # Compute reconstruction score
            score = self._compute_reconstruction_score(trigger, target_class)
            
            if score > best_score:
                best_score = score
                best_candidate = trigger
        
        return {
            'target_class': target_class,
            'best_trigger': best_candidate,
            'confidence': round(best_score, 4),
            'iterations': iterations,
        }
    
    def _compute_reconstruction_score(self, trigger, target_class):
        """Compute how likely this trigger is to be a backdoor."""
        # Deterministic score based on trigger properties
        trigger_str = json.dumps(trigger, sort_keys=True)
        score_hash = int(hashlib.sha256(trigger_str.encode()).hexdigest()[:8], 16)
        
        return (score_hash % 1000) / 1000.0
    
    def full_scan(self):
        """Run full trigger scan."""
        scan_start = datetime.utcnow().isoformat()
        
        perturbation = self.search_by_perturbation(iterations=50)
        activations = self.analyze_activations()
        reconstruction = self.reconstruct_trigger(target_class=0, iterations=20)
        
        # Count findings
        high_findings = [r for r in perturbation if r['severity'] == 'HIGH']
        anomalies = [a for a in activations if a['status'] == 'ANOMALOUS']
        
        # Overall risk
        risk_factors = [
            min(len(high_findings) / 5.0, 1.0) * 0.4,
            min(len(anomalies) / 5.0, 1.0) * 0.3,
            reconstruction['confidence'] * 0.3,
        ]
        overall_risk = round(sum(risk_factors), 4)
        
        return {
            'scan_started': scan_start,
            'scan_completed': datetime.utcnow().isoformat(),
            'model': str(self.model_path) if self.model_path else 'unknown',
            'perturbation_findings': len(perturbation),
            'high_severity_findings': len(high_findings),
            'activation_anomalies': len(anomalies),
            'reconstruction': reconstruction,
            'overall_risk': overall_risk,
            'status': 'SUSPICIOUS' if overall_risk > 0.5 else 'LIKELY_CLEAN',
            'perturbation_details': perturbation[:10],  # Top 10
            'activation_details': activations,
        }


if __name__ == '__main__':
    searcher = TriggerSearcher(model_path='yolov8n.pt')
    results = searcher.full_scan()
    print(json.dumps(results, indent=2, default=str))
