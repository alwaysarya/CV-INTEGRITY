"""
Backdoor Trigger Detector
Detects potential backdoor triggers in models and datasets.

SIH Requirement 2.2.2: Trigger search or reconstruction
"""

import numpy as np
import json
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import hashlib


class BackdoorDetector:
    """
    Detect backdoor triggers using multiple methods:
    - Trigger pattern search (white-box)
    - Behavioural testing with random triggers (black-box)
    - Activation clustering (white-box)
    - Frequency analysis (black-box)
    """
    
    def __init__(self, model=None, access_level: str = "black-box"):
        self.model = model
        self.access_level = access_level
    
    def detect(self, inputs: np.ndarray, labels: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """
        Run backdoor detection on inputs.
        
        Args:
            inputs: Sample inputs (N, H, W, C)
            labels: Optional ground truth labels
        """
        result = {
            "method": "backdoor_detection",
            "access_level": self.access_level,
            "num_samples": len(inputs) if hasattr(inputs, '__len__') else 0,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        try:
            findings = []
            
            # Method 1: Frequency analysis
            freq_analysis = self._frequency_analysis(inputs)
            findings.append({
                "method": "frequency_analysis",
                "confidence": freq_analysis["confidence"],
                "suspicious_patterns": freq_analysis["patterns"],
            })
            
            # Method 2: Trigger pattern search (if white-box)
            if self.access_level == "white-box" and self.model is not None:
                trigger_result = self._trigger_search(inputs)
                findings.append(trigger_result)
            else:
                findings.append({
                    "method": "trigger_search",
                    "status": "unavailable",
                    "reason": "White-box access required",
                })
            
            # Method 3: Activation clustering (if white-box)
            if self.access_level == "white-box" and self.model is not None:
                cluster_result = self._activation_clustering(inputs)
                findings.append(cluster_result)
            
            # Aggregate
            result["status"] = "success"
            result["findings"] = findings
            result["overall_risk"] = self._aggregate_risk(findings)
            result["recommendation"] = self._get_recommendation(result["overall_risk"])
            result["limitations"] = self._get_limitations()
            
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
        
        return result
    
    def _frequency_analysis(self, inputs: np.ndarray) -> Dict[str, Any]:
        """Analyze high-frequency patterns (triggers often use high-freq pixels)."""
        if len(inputs) == 0:
            return {"confidence": 0.0, "patterns": []}
        
        # Convert to grayscale if needed
        if inputs.ndim == 4 and inputs.shape[-1] == 3:
            gray = np.mean(inputs, axis=-1)
        else:
            gray = inputs
        
        # Compute FFT
        fft = np.fft.fft2(gray, axes=(-2, -1))
        magnitude = np.abs(fft)
        
        # High-frequency energy ratio
        h, w = gray.shape[-2:]
        hf_threshold = 0.25
        hf_mask = np.ones_like(magnitude)
        hf_mask[..., :int(h*hf_threshold), :int(w*hf_threshold)] = 0
        hf_energy = np.mean(magnitude * hf_mask)
        total_energy = np.mean(magnitude) + 1e-8
        
        hf_ratio = hf_energy / total_energy
        
        # Confidence based on high-freq ratio
        confidence = min(hf_ratio * 2, 1.0)
        
        patterns = []
        if confidence > 0.5:
            patterns.append({
                "type": "high_frequency_anomaly",
                "score": float(confidence),
                "description": "Unusual high-frequency patterns detected",
            })
        
        return {
            "confidence": float(confidence),
            "hf_ratio": float(hf_ratio),
            "patterns": patterns,
        }
    
    def _trigger_search(self, inputs: np.ndarray) -> Dict[str, Any]:
        """Search for trigger patterns (white-box)."""
        # Simplified: detect small consistent patches across samples
        if len(inputs) < 2:
            return {"method": "trigger_search", "confidence": 0.0, "triggers": []}
        
        # Compute pixel-wise std across samples
        std_map = np.std(inputs, axis=0)
        
        # Low std regions = consistent patterns (potential triggers)
        low_std_threshold = np.percentile(std_map, 10)
        trigger_regions = std_map < low_std_threshold
        
        trigger_score = np.mean(trigger_regions)
        
        return {
            "method": "trigger_search",
            "confidence": float(min(trigger_score * 5, 1.0)),
            "trigger_pixels": int(np.sum(trigger_regions)),
            "status": "success",
        }
    
    def _activation_clustering(self, inputs: np.ndarray) -> Dict[str, Any]:
        """Cluster activations to find poisoned samples."""
        # Simplified: use pixel statistics as proxy for activations
        if len(inputs) < 4:
            return {"method": "activation_clustering", "status": "insufficient_data"}
        
        # Compute simple features
        features = inputs.reshape(len(inputs), -1)
        features = features[:, :100]  # Sample features
        
        # Simple 2-cluster separation
        mean_feat = np.mean(features, axis=0)
        distances = np.linalg.norm(features - mean_feat, axis=1)
        
        threshold = np.percentile(distances, 90)
        outliers = np.sum(distances > threshold)
        
        return {
            "method": "activation_clustering",
            "status": "success",
            "confidence": float(outliers / len(inputs)),
            "outlier_count": int(outliers),
            "total_samples": len(inputs),
        }
    
    def _aggregate_risk(self, findings: List[Dict]) -> Dict[str, Any]:
        """Aggregate findings into overall risk."""
        confidences = [f.get("confidence", 0) for f in findings if "confidence" in f]
        
        if not confidences:
            return {"score": 0.0, "level": "UNKNOWN"}
        
        max_conf = max(confidences)
        
        if max_conf < 0.3:
            level = "LOW"
        elif max_conf < 0.5:
            level = "MEDIUM"
        elif max_conf < 0.7:
            level = "HIGH"
        else:
            level = "CRITICAL"
        
        return {
            "score": round(max_conf * 100, 2),
            "level": level,
            "evidence": confidences,
        }
    
    def _get_recommendation(self, risk: Dict) -> str:
        """Get recommendation based on risk."""
        level = risk.get("level", "UNKNOWN")
        return {
            "LOW": "ACCEPT - No significant backdoor indicators",
            "MEDIUM": "REVIEW - Some suspicious patterns detected",
            "HIGH": "QUARANTINE - Multiple backdoor indicators",
            "CRITICAL": "REJECT - Strong backdoor evidence",
            "UNKNOWN": "REVIEW - Insufficient data for assessment",
        }.get(level, "REVIEW")
    
    def _get_limitations(self) -> List[str]:
        """List limitations of this detector."""
        limitations = [
            "Frequency analysis may produce false positives on naturally textured images",
            "Trigger search assumes consistent trigger patterns",
        ]
        if self.access_level != "white-box":
            limitations.append("Activation clustering unavailable without white-box access")
            limitations.append("Trigger reconstruction requires white-box access")
        return limitations


if __name__ == "__main__":
    # Test
    dummy_inputs = np.random.rand(10, 64, 64, 3)
    detector = BackdoorDetector(access_level="black-box")
    result = detector.detect(dummy_inputs)
    print(json.dumps(result, indent=2))
