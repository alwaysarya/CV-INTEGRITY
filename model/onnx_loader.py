"""
ONNX Model Loader
Supports loading and inference for ONNX models.
Complies with SIH requirement for ONNX support.
"""

import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any, List
import hashlib
import json
from datetime import datetime


class ONNXModelLoader:
    """
    Load and run inference on ONNX models.
    
    Features:
    - Load ONNX models
    - Run inference
    - Extract model metadata (input/output shapes)
    - Compute model fingerprint
    """
    
    def __init__(self, model_path: str):
        self.model_path = Path(model_path)
        self.session = None
        self.model = None
        self.input_name = None
        self.output_names = None
        self.model_hash = None
        
    def load(self) -> Dict[str, Any]:
        """Load ONNX model."""
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
            
            self.session = ort.InferenceSession(
                str(self.model_path),
                providers=['CPUExecutionProvider']
            )
            
            # Get input/output info
            inputs = self.session.get_inputs()
            outputs = self.session.get_outputs()
            
            self.input_name = inputs[0].name
            self.output_names = [o.name for o in outputs]
            
            result["status"] = "success"
            result["framework"] = "onnx"
            result["inputs"] = [
                {"name": i.name, "shape": i.shape, "type": i.type}
                for i in inputs
            ]
            result["outputs"] = [
                {"name": o.name, "shape": o.shape, "type": o.type}
                for o in outputs
            ]
            result["model_hash"] = self._compute_hash()
            self.model_hash = result["model_hash"]
            
        except ImportError:
            result["status"] = "failed"
            result["error"] = "onnxruntime not installed. Run: pip install onnxruntime"
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
        
        return result
    
    def infer(self, input_data: np.ndarray) -> Dict[str, Any]:
        """Run inference on ONNX model."""
        result = {
            "timestamp": datetime.utcnow().isoformat(),
            "model_hash": self.model_hash,
        }
        
        if self.session is None:
            result["status"] = "failed"
            result["error"] = "Model not loaded. Call load() first."
            return result
        
        try:
            # Prepare input
            if input_data.ndim == 3:
                input_data = np.expand_dims(input_data, 0)
            
            input_data = input_data.astype(np.float32)
            
            # Run inference
            outputs = self.session.run(self.output_names, {self.input_name: input_data})
            
            result["status"] = "success"
            result["outputs"] = [o.tolist() for o in outputs]
            result["input_hash"] = hashlib.sha256(input_data.tobytes()).hexdigest()[:16]
            result["output_hash"] = hashlib.sha256(
                b"".join([o.tobytes() for o in outputs])
            ).hexdigest()[:16]
            
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
        
        return result
    
    def _compute_hash(self) -> str:
        """Compute SHA-256 of model file."""
        sha = hashlib.sha256()
        with open(self.model_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha.update(chunk)
        return sha.hexdigest()
    
    def get_fingerprint(self) -> Dict[str, Any]:
        """Get model fingerprint for integrity verification."""
        if not self.model_path.exists():
            return {"status": "failed", "error": "Model not found"}
        
        return {
            "model_name": self.model_path.stem,
            "model_hash": self._compute_hash(),
            "model_size_bytes": self.model_path.stat().st_size,
            "framework": "onnx",
            "timestamp": datetime.utcnow().isoformat(),
        }


def load_any_model(model_path: str) -> Dict[str, Any]:
    """
    Auto-detect model format and load.
    Supports: .onnx, .pt, .pth, .torchscript
    """
    path = Path(model_path)
    suffix = path.suffix.lower()
    
    if suffix == ".onnx":
        loader = ONNXModelLoader(model_path)
        return loader.load()
    elif suffix in [".pt", ".pth"]:
        return {
            "status": "success",
            "framework": "pytorch",
            "model_path": str(path),
            "note": "PyTorch model - use torch.load() for full access",
            "model_hash": hashlib.sha256(path.read_bytes()).hexdigest(),
        }
    else:
        return {
            "status": "failed",
            "error": f"Unsupported format: {suffix}",
        }


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = load_any_model(sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python onnx_loader.py <model_path>")
