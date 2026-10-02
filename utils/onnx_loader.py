"""
ONNX Model Loader
Supports ONNX format for model integrity assessment.
"""

import hashlib
from pathlib import Path
from typing import Optional, Dict, Any


class ONNXLoader:
    """Load and inspect ONNX models."""
    
    @staticmethod
    def is_onnx(filepath: str) -> bool:
        """Check if file is ONNX format."""
        return str(filepath).lower().endswith('.onnx')
    
    @staticmethod
    def load_metadata(filepath: str) -> Optional[Dict[str, Any]]:
        """Load ONNX model metadata."""
        try:
            import onnx
            model = onnx.load(filepath)
            
            return {
                'format': 'ONNX',
                'ir_version': model.ir_version,
                'producer_name': model.producer_name,
                'producer_version': model.producer_version,
                'domain': model.domain,
                'model_version': model.model_version,
                'graph_name': model.graph.name,
                'inputs': [
                    {
                        'name': inp.name,
                        'type': str(inp.type),
                    }
                    for inp in model.graph.input
                ],
                'outputs': [
                    {
                        'name': out.name,
                        'type': str(out.type),
                    }
                    for out in model.graph.output
                ],
                'num_nodes': len(model.graph.node),
                'num_initializers': len(model.graph.initializer),
            }
        except ImportError:
            return {
                'format': 'ONNX',
                'error': 'onnx library not installed. Run: pip install onnx',
                'note': 'File detected but cannot parse',
            }
        except Exception as e:
            return {
                'format': 'ONNX',
                'error': str(e),
            }
    
    @staticmethod
    def hash_model(filepath: str) -> str:
        """SHA-256 hash of ONNX file."""
        sha256 = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(65536), b''):
                sha256.update(chunk)
        return sha256.hexdigest()
    
    @staticmethod
    def verify(filepath: str, expected_hash: str) -> Dict[str, Any]:
        """Verify ONNX model integrity."""
        actual_hash = ONNXLoader.hash_model(filepath)
        return {
            'file': filepath,
            'expected_hash': expected_hash,
            'actual_hash': actual_hash,
            'match': actual_hash == expected_hash,
            'status': 'VERIFIED' if actual_hash == expected_hash else 'TAMPERED',
        }


if __name__ == '__main__':
    # Test
    print("ONNX Loader ready")
