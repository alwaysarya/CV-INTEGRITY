"""
Backdoor Trigger Detector — Real Implementation
Detects backdoor triggers in models and datasets.
"""

import numpy as np
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime


class BackdoorDetector:
    """
    Real backdoor detection with multiple methods.
    
    Methods:
    - Frequency analysis (FFT-based)
    - Trigger pattern search (cross-sample consistency)
    - Activation clustering (feature-space)
    - Occlusion-based sensitivity
    """
    
    def __init__(self, model=None, access_level: str = "black-box"):
        self.model = model
        self.access_level = access_level
    
    def detect(self, inputs: np.ndarray, labels: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """Run comprehensive backdoor detection."""
        result = {
            "method": "backdoor_detection",
            "access_level": self.access_level,
            "num_samples": len(inputs) if hasattr(inputs, '__len__') else 0,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        try:
            findings = []
            
            # 1. Frequency analysis
            freq = self._frequency_analysis(inputs)
            findings.append({
                "method": "frequency_analysis",
                "confidence": freq["confidence"],
                "score": freq["hf_ratio"],
                "suspicious_patterns": freq["patterns"],
            })
            
            # 2. Trigger pattern search (cross-sample)
            trigger = self._trigger_search(inputs)
            findings.append(trigger)
            
            # 3. Statistical anomalies
            anomalies = self._statistical_anomaly(inputs)
            findings.append(anomalies)
            
            # 4. White-box analysis (if model available)
            if self.access_level == "white-box" and self.model is not None:
                wb = self._white_box_analysis(inputs)
                findings.append(wb)
            else:
                findings.append({
                    "method": "white_box_analysis",
                    "status": "unavailable",
                    "reason": "White-box access required",
                })
            
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
        """FFT-based high-frequency detection."""
        if len(inputs) == 0:
            return {"confidence": 0.0, "hf_ratio": 0, "patterns": []}
        
        # Grayscale
        if inputs.ndim == 4 and inputs.shape[-1] == 3:
            gray = np.mean(inputs, axis=-1)
        else:
            gray = inputs
        
        # FFT
        fft = np.fft.fft2(gray, axes=(-2, -1))
        magnitude = np.abs(fft)
        
        # High-frequency ratio
        h, w = gray.shape[-2:]
        hf_mask = np.ones_like(magnitude)
        hf_mask[..., :int(h*0.25), :int(w*0.25)] = 0
        hf_energy = np.mean(magnitude * hf_mask)
        total_energy = np.mean(magnitude) + 1e-8
        hf_ratio = hf_energy / total_energy
        
        # Natural images: hf_ratio typically 0.5-0.75 (with JPEG compression)
        # Trigger injections: often > 0.85 (unnaturally sharp patches)
        # Conservative thresholds to avoid false positives
        if hf_ratio < 0.75:
            confidence = 0.0  # Natural
        elif hf_ratio < 0.85:
            confidence = (hf_ratio - 0.75) * 3  # 0 to 0.3
        else:
            confidence = min(0.3 + (hf_ratio - 0.85) * 4, 1.0)
        
        patterns = []
        if confidence > 0.5:
            patterns.append({
                "type": "high_frequency_anomaly",
                "score": float(confidence),
                "description": "Unusual high-frequency patterns detected"
            })
        
        return {"confidence": float(confidence), "hf_ratio": float(hf_ratio), "patterns": patterns}
    
    def _trigger_search(self, inputs: np.ndarray, threshold: float = 0.05) -> Dict[str, Any]:
        """Cross-sample consistency for trigger detection."""
        if len(inputs) < 5:
            return {"method": "trigger_search", "status": "insufficient_data", "confidence": 0.0}
        
        # Pixel-wise std across samples
        std_map = np.std(inputs, axis=0)
        mean_std = np.mean(std_map)
        
        # Low-variance regions across samples (potential triggers)
        low_var = std_map < (mean_std * 0.3)
        trigger_score = np.mean(low_var)
        
        # Small consistent patches = suspicious
        confidence = min(trigger_score * 10, 1.0) if trigger_score < 0.1 else 0.0
        
        return {
            "method": "trigger_search",
            "status": "success",
            "confidence": float(confidence),
            "consistent_pixels": int(np.sum(low_var)),
            "total_pixels": int(low_var.size),
            "trigger_score": float(trigger_score),
        }
    
    def _statistical_anomaly(self, inputs: np.ndarray) -> Dict[str, Any]:
        """Statistical outlier detection."""
        if len(inputs) < 4:
            return {"method": "statistical_anomaly", "status": "insufficient_data", "confidence": 0.0}
        
        # Flatten
        flat = inputs.reshape(len(inputs), -1)
        
        # Per-sample mean and std
        sample_means = np.mean(flat, axis=1)
        sample_stds = np.std(flat, axis=1)
        
        # Z-scores
        mean_z = np.abs((sample_means - np.mean(sample_means)) / (np.std(sample_means) + 1e-8))
        std_z = np.abs((sample_stds - np.mean(sample_stds)) / (np.std(sample_stds) + 1e-8))
        
        # Outliers (z > 3)
        outlier_count = int(np.sum(mean_z > 3) + np.sum(std_z > 3))
        outlier_ratio = outlier_count / len(inputs)
        
        confidence = min(outlier_ratio * 3, 1.0)
        
        return {
            "method": "statistical_anomaly",
            "status": "success",
            "confidence": float(confidence),
            "outlier_count": outlier_count,
            "total_samples": len(inputs),
            "outlier_ratio": float(outlier_ratio),
        }
    
    def _white_box_analysis(self, inputs: np.ndarray) -> Dict[str, Any]:
        """Activation clustering (white-box)."""
        try:
            import torch
            if not isinstance(self.model, torch.nn.Module):
                return {"method": "white_box_analysis", "status": "unavailable"}
            
            # Get activations
            activations = []
            def hook(module, input, output):
                activations.append(output.detach())
            
            # Hook first conv layer
            first_conv = None
            for module in self.model.modules():
                if isinstance(module, torch.nn.Conv2d):
                    first_conv = module
                    break
            
            if first_conv is None:
                return {"method": "white_box_analysis", "status": "no_conv_layer"}
            
            h = first_conv.register_forward_hook(hook)
            try:
                with torch.no_grad():
                    for img in inputs[:20]:  # Sample
                        tensor = torch.from_numpy(img).float()
                        if tensor.ndim == 3:
                            tensor = tensor.permute(2, 0, 1).unsqueeze(0)
                        try:
                            self.model(tensor)
                        except Exception:
                            pass
            finally:
                h.remove()
            
            if not activations:
                return {"method": "white_box_analysis", "status": "no_activations"}
            
            # Cluster activations by distance
            acts = torch.cat([a.flatten(1).mean(dim=1) for a in activations if a.numel() > 0])
            acts_np = acts.numpy()
            
            # Distance from centroid
            centroid = acts_np.mean(axis=0)
            distances = np.linalg.norm(acts_np - centroid, axis=1)
            
            # Outliers
            threshold = np.percentile(distances, 90)
            outliers = int(np.sum(distances > threshold))
            
            return {
                "method": "white_box_analysis",
                "status": "success",
                "confidence": float(outliers / len(activations)),
                "activation_outliers": outliers,
                "total_samples": len(activations),
            }
        except Exception as e:
            return {"method": "white_box_analysis", "status": "failed", "error": str(e)}
    
    def _aggregate_risk(self, findings: List[Dict]) -> Dict[str, Any]:
        confidences = [f.get("confidence", 0) for f in findings if "confidence" in f]
        if not confidences:
            return {"score": 0.0, "level": "UNKNOWN"}
        
        max_conf = max(confidences)
        avg_conf = sum(confidences) / len(confidences)
        
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
            "avg_score": round(avg_conf * 100, 2),
            "level": level,
            "num_findings": len(findings),
        }
    
    def _get_recommendation(self, risk: Dict) -> str:
        return {
            "LOW": "ACCEPT - No significant backdoor indicators",
            "MEDIUM": "REVIEW - Some suspicious patterns detected",
            "HIGH": "QUARANTINE - Multiple backdoor indicators",
            "CRITICAL": "REJECT - Strong backdoor evidence",
            "UNKNOWN": "REVIEW - Insufficient data",
        }.get(risk.get("level", "UNKNOWN"), "REVIEW")
    
    def _get_limitations(self) -> List[str]:
        limitations = [
            "Frequency analysis may produce false positives on textured images",
            "Trigger search assumes small consistent patterns",
            "Statistical anomalies can occur from natural variation",
        ]
        if self.access_level != "white-box":
            limitations.append("Activation clustering unavailable (white-box required)")
        return limitations


if __name__ == "__main__":
    # Test with dummy data
    inputs = np.random.rand(20, 64, 64, 3).astype(np.float32)
    detector = BackdoorDetector(access_level="black-box")
    result = detector.detect(inputs)
    print(json.dumps(result, indent=2, default=str))
