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
