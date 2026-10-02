"""
ONNX Model Loader — Real Implementation
Supports ONNX model loading, inference, and integrity fingerprinting.
"""

import numpy as np
import hashlib
import json
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime


class ONNXModelLoader:
    """Real ONNX loader with inference and fingerprinting."""
    
    def __init__(self, model_path: str):
        self.model_path = Path(model_path)
        self.session = None
        self.input_name = None
        self.output_names = None
        self.model_hash = None
        self.input_shape = None
        self.output_shape = None
    
    def load(self) -> Dict[str, Any]:
        result = {
            "model_path": str(self.model_path),
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        if not self.model_path.exists():
            result["status"] = "failed"
            result["error"] = f"Model not found: {self.model_path}"
            return result
        
        try:
            import onnxruntime as ort
            
            providers = ['CPUExecutionProvider']
            self.session = ort.InferenceSession(str(self.model_path), providers=providers)
            
            inputs = self.session.get_inputs()
            outputs = self.session.get_outputs()
            
            self.input_name = inputs[0].name
            self.output_names = [o.name for o in outputs]
            self.input_shape = inputs[0].shape
            self.output_shape = outputs[0].shape
            
            result["status"] = "success"
            result["framework"] = "onnx"
            result["providers"] = providers
            result["inputs"] = [{"name": i.name, "shape": i.shape, "type": i.type} for i in inputs]
            result["outputs"] = [{"name": o.name, "shape": o.shape, "type": o.type} for o in outputs]
            result["model_hash"] = self._compute_hash()
            result["model_size_bytes"] = self.model_path.stat().st_size
            self.model_hash = result["model_hash"]
            
        except ImportError:
            result["status"] = "failed"
            result["error"] = "onnxruntime not installed"
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
        
        return result
    
    def infer(self, input_data: np.ndarray) -> Dict[str, Any]:
        result = {"timestamp": datetime.utcnow().isoformat(), "model_hash": self.model_hash}
        
        if self.session is None:
            result["status"] = "failed"
            result["error"] = "Model not loaded"
            return result
        
        try:
            input_data = input_data.astype(np.float32)
            if len(input_data.shape) == 3:
                input_data = np.expand_dims(input_data, 0)
            
            outputs = self.session.run(self.output_names, {self.input_name: input_data})
            
            result["status"] = "success"
            result["output_shapes"] = [list(o.shape) for o in outputs]
            result["input_hash"] = hashlib.sha256(input_data.tobytes()).hexdigest()[:16]
            result["output_hash"] = hashlib.sha256(b"".join([o.tobytes() for o in outputs])).hexdigest()[:16]
            
            if len(outputs) > 0 and outputs[0].size > 0:
                flat = outputs[0].flatten()
                result["top_class"] = int(np.argmax(flat))
                result["top_confidence"] = float(np.max(flat))
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
        
        return result
    
    def _compute_hash(self) -> str:
        sha = hashlib.sha256()
        with open(self.model_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha.update(chunk)
        return sha.hexdigest()
    
    def get_fingerprint(self) -> Dict[str, Any]:
        if not self.model_path.exists():
            return {"status": "failed", "error": "Model not found"}
        return {
            "model_name": self.model_path.stem,
            "model_hash": self._compute_hash(),
            "model_size_bytes": self.model_path.stat().st_size,
            "framework": "onnx",
            "timestamp": datetime.utcnow().isoformat(),
        }


class PyTorchModelLoader:
    """PyTorch model loader for .pt / .pth files."""
    
    def __init__(self, model_path: str):
        self.model_path = Path(model_path)
        self.model = None
        self.model_hash = None
    
    def load(self) -> Dict[str, Any]:
        result = {
            "model_path": str(self.model_path),
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        if not self.model_path.exists():
            result["status"] = "failed"
            result["error"] = "Model not found"
            return result
        
        try:
            import torch
        except ImportError as e:
            result["status"] = "failed"
            result["error"] = f"PyTorch import failed: {e}"
            return result
        
        try:
            self.model = torch.load(str(self.model_path), map_location='cpu', weights_only=False)
            
            if isinstance(self.model, dict):
                # YOLO checkpoint format
                param_count = 0
                if 'model' in self.model:
                    inner = self.model['model']
                    if hasattr(inner, 'parameters'):
                        param_count = sum(p.numel() for p in inner.parameters())
                # Fallback: count tensors in dict
                if param_count == 0:
                    param_count = sum(v.numel() for v in self.model.values() if hasattr(v, 'numel'))
                result["checkpoint_keys"] = list(self.model.keys())[:10]
            else:
                param_count = sum(p.numel() for p in self.model.parameters())
            
            result["status"] = "success"
            result["framework"] = "pytorch"
            result["parameter_count"] = param_count
            result["model_hash"] = self._compute_hash()
            result["model_size_bytes"] = self.model_path.stat().st_size
            self.model_hash = result["model_hash"]
            
        except Exception as e:
            result["status"] = "failed"
            result["error"] = f"Load failed: {type(e).__name__}: {e}"
        
        return result
    
    def _compute_hash(self) -> str:
        sha = hashlib.sha256()
        with open(self.model_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha.update(chunk)
        return sha.hexdigest()
    
    def get_fingerprint(self) -> Dict[str, Any]:
        if not self.model_path.exists():
            return {"status": "failed", "error": "Model not found"}
        return {
            "model_name": self.model_path.stem,
            "model_hash": self._compute_hash(),
            "model_size_bytes": self.model_path.stat().st_size,
            "framework": "pytorch",
            "timestamp": datetime.utcnow().isoformat(),
        }

    def analyze_weights(self, baseline_path: str = None) -> Dict[str, Any]:
        """
        Real weight-level model integrity analysis.

        Analyzes:
        - Weight distribution statistics (mean, std, min, max)
        - Layer-wise L2 norms
        - Weight anomaly score
        - Baseline comparison (if baseline provided)

        Returns:
            dict with weight analysis + anomaly score + verdict
        """
        result = {
            "model_name": self.model_path.stem,
            "model_path": str(self.model_path),
            "timestamp": datetime.utcnow().isoformat(),
        }

        if not self.model_path.exists():
            result["status"] = "failed"
            result["error"] = "Model not found"
            return result

        try:
            import torch
        except ImportError:
            result["status"] = "failed"
            result["error"] = "PyTorch not installed"
            return result

        try:
            checkpoint = torch.load(str(self.model_path), map_location='cpu', weights_only=False)

            # Extract state_dict (handle YOLO checkpoint format)
            state_dict = None
            if isinstance(checkpoint, dict):
                # Try 'model' first
                inner = checkpoint.get('model')
                # If 'model' is None, try 'ema' (GOOD model case)
                if inner is None:
                    inner = checkpoint.get('ema')
                if inner is not None:
                    if hasattr(inner, 'state_dict'):
                        state_dict = inner.state_dict()
                    elif isinstance(inner, dict):
                        state_dict = inner
                else:
                    # Fallback: use whole checkpoint as state_dict
                    state_dict = checkpoint
            elif hasattr(checkpoint, 'state_dict'):
                state_dict = checkpoint.state_dict()

            if not state_dict:
                result["status"] = "failed"
                result["error"] = "No state_dict found"
                return result

            # Collect weights (only floating point tensors)
            all_weights = []
            layer_stats = []

            for name, tensor in state_dict.items():
                if not hasattr(tensor, 'numel') or tensor.numel() == 0:
                    continue
                if not hasattr(tensor, 'float') or tensor.dtype not in (torch.float32, torch.float64, torch.float16):
                    continue

                flat = tensor.flatten().float()
                all_weights.append(flat)

                layer_stats.append({
                    "name": name,
                    "shape": list(tensor.shape),
                    "params": int(tensor.numel()),
                    "mean": float(flat.mean()),
                    "std": float(flat.std()),
                    "min": float(flat.min()),
                    "max": float(flat.max()),
                    "l2_norm": float(torch.norm(flat)),
                })

            if not all_weights:
                result["status"] = "failed"
                result["error"] = "No float weights found"
                return result

            # Global statistics
            all_concat = torch.cat(all_weights)
            global_stats = {
                "total_parameters": int(all_concat.numel()),
                "mean": float(all_concat.mean()),
                "std": float(all_concat.std()),
                "min": float(all_concat.min()),
                "max": float(all_concat.max()),
                "l2_norm": float(torch.norm(all_concat)),
                "num_layers": len(layer_stats),
            }

            # Histogram (10 bins)
            hist = torch.histc(all_concat, bins=10, min=float(all_concat.min()), max=float(all_concat.max()))
            global_stats["histogram"] = [int(x) for x in hist.tolist()]

            # Weight anomaly detection (based on extreme values)
            # Normal models: weights typically in [-3, 3] range
            # Backdoored: may have extreme values or unusual distributions
            extreme_count = int((torch.abs(all_concat) > 5.0).sum())
            extreme_ratio = extreme_count / all_concat.numel()

            # Sparsity
            near_zero = int((torch.abs(all_concat) < 1e-6).sum())
            sparsity = near_zero / all_concat.numel()

            anomaly_score = min(extreme_ratio * 10, 1.0)

            result["status"] = "success"
            result["global_stats"] = global_stats
            result["layer_stats"] = layer_stats[:20]  # First 20 layers
            result["total_layers"] = len(layer_stats)
            result["anomaly"] = {
                "extreme_weights_count": extreme_count,
                "extreme_weights_ratio": round(extreme_ratio, 6),
                "sparsity": round(sparsity, 4),
                "anomaly_score": round(anomaly_score, 4),
            }

            # Baseline comparison
            if baseline_path and Path(baseline_path).exists():
                try:
                    base_ckpt = torch.load(baseline_path, map_location='cpu', weights_only=False)
                    base_state = None
                    if isinstance(base_ckpt, dict):
                        if 'model' in base_ckpt and hasattr(base_ckpt['model'], 'state_dict'):
                            base_state = base_ckpt['model'].state_dict()
                        elif 'model' in base_ckpt and isinstance(base_ckpt['model'], dict):
                            base_state = base_ckpt['model']
                        else:
                            base_state = base_ckpt
                    elif hasattr(base_ckpt, 'state_dict'):
                        base_state = base_ckpt.state_dict()

                    if base_state:
                        # Compare layer-by-layer where shapes match
                        similarities = []
                        matched_layers = 0
                        for name, tensor in state_dict.items():
                            if name in base_state and hasattr(tensor, 'numel'):
                                base_tensor = base_state[name]
                                if hasattr(base_tensor, 'numel') and tensor.shape == base_tensor.shape:
                                    a = tensor.flatten().float()
                                    b = base_tensor.flatten().float()
                                    if a.numel() > 0:
                                        # Cosine similarity
                                        cos = float(torch.nn.functional.cosine_similarity(a.unsqueeze(0), b.unsqueeze(0)))
                                        similarities.append(cos)
                                        matched_layers += 1

                        if similarities:
                            avg_sim = sum(similarities) / len(similarities)
                            result["baseline_comparison"] = {
                                "baseline": Path(baseline_path).stem,
                                "matched_layers": matched_layers,
                                "total_layers": len(state_dict),
                                "avg_cosine_similarity": round(avg_sim, 4),
                                "min_similarity": round(min(similarities), 4),
                                "max_similarity": round(max(similarities), 4),
                                "divergence": round(1.0 - avg_sim, 4),
                            }
                            # Update anomaly score with baseline divergence
                            anomaly_score = max(anomaly_score, 1.0 - avg_sim)
                            result["anomaly"]["anomaly_score"] = round(anomaly_score, 4)
                except Exception as e:
                    result["baseline_comparison"] = {"status": "failed", "error": str(e)}

            # Determine verdict (thresholds calibrated for YOLO models)
            # Based on observed divergence range: 0.5% (identical) to 10% (very different)
            if anomaly_score < 0.01:      # < 1% divergence
                risk_level = "LOW"
                verdict = "ACCEPT"
            elif anomaly_score < 0.05:    # 1-5% divergence
                risk_level = "MEDIUM"
                verdict = "REVIEW"
            elif anomaly_score < 0.15:    # 5-15% divergence
                risk_level = "HIGH"
                verdict = "QUARANTINE"
            else:                          # > 15% divergence
                risk_level = "CRITICAL"
                verdict = "REJECT"

            result["overall_risk"] = {
                "level": risk_level,
                "score": round(anomaly_score * 100, 2),
            }
            result["recommendation"] = f"{verdict} - " + {
                "ACCEPT": "Weight distribution normal, no anomalies detected",
                "REVIEW": "Some weight anomalies detected, manual review recommended",
                "QUARANTINE": "Significant weight anomalies, quarantine recommended",
                "REJECT": "Critical weight anomalies detected",
            }.get(verdict, "")

            result["limitations"] = [
                "Weight analysis detects structural anomalies, not semantic backdoors",
                "Baseline comparison requires model trained on similar architecture",
                "No detection of input-triggered (runtime) backdoors",
                "Thresholds calibrated for computer vision models",
            ]

        except Exception as e:
            result["status"] = "failed"
            result["error"] = f"{type(e).__name__}: {e}"

        return result


def load_any_model(model_path: str) -> Dict[str, Any]:
    """Auto-detect format and load."""
    path = Path(model_path)
    suffix = path.suffix.lower()
    
    if suffix == ".onnx":
        return ONNXModelLoader(model_path).load()
    elif suffix in [".pt", ".pth", ".ckpt"]:
        return PyTorchModelLoader(model_path).load()
    else:
        return {
            "status": "failed",
            "error": f"Unsupported format: {suffix}",
            "supported": [".onnx", ".pt", ".pth"],
        }


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = load_any_model(sys.argv[1])
        print(json.dumps(result, indent=2, default=str))
    else:
        print("Usage: python onnx_loader.py <model_path>")
