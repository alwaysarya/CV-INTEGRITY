"""
Format Detector
Auto-detects dataset and model formats.
"""

from pathlib import Path
from utils.coco_loader import COCOLoader
from utils.onnx_loader import ONNXLoader


class FormatDetector:
    """Detect formats of models and datasets."""
    
    SUPPORTED_MODEL_FORMATS = ['ONNX', 'PyTorch', 'TorchScript']
    SUPPORTED_DATASET_FORMATS = ['COCO', 'YOLO']
    
    @staticmethod
    def detect_model_format(filepath: str) -> dict:
        """Detect model format from file."""
        path = Path(filepath)
        if not path.exists():
            return {'format': 'UNKNOWN', 'error': 'File not found'}
        
        ext = path.suffix.lower()
        
        if ext == '.onnx':
            return {
                'format': 'ONNX',
                'supported': True,
                'loader': 'ONNXLoader',
            }
        elif ext == '.pt' or ext == '.pth':
            return {
                'format': 'PyTorch',
                'supported': True,
                'loader': 'torch.load',
            }
        elif ext == '.ts':
            return {
                'format': 'TorchScript',
                'supported': True,
                'loader': 'torch.jit.load',
            }
        else:
            return {
                'format': 'UNKNOWN',
                'supported': False,
                'error': f'Unsupported format: {ext}',
            }
    
    @staticmethod
    def detect_dataset_format(dataset_dir: str) -> dict:
        """Detect dataset format from directory."""
        result = COCOLoader.detect_format(dataset_dir)
        
        if result.get('format') in FormatDetector.SUPPORTED_DATASET_FORMATS:
            result['supported'] = True
        else:
            result['supported'] = False
        
        return result
    
    @staticmethod
    def coverage_statement() -> dict:
        """Return format coverage statement."""
        return {
            'models': {
                'ONNX': {'supported': True, 'notes': 'Full metadata parsing'},
                'PyTorch (.pt/.pth)': {'supported': True, 'notes': 'Native loading'},
                'TorchScript (.ts)': {'supported': True, 'notes': 'Via torch.jit'},
                'TensorFlow': {'supported': False, 'notes': 'Not in scope'},
                'Caffe': {'supported': False, 'notes': 'Not in scope'},
            },
            'datasets': {
                'COCO': {'supported': True, 'notes': 'JSON annotations'},
                'YOLO': {'supported': True, 'notes': 'YAML + txt labels'},
                'Pascal VOC': {'supported': False, 'notes': 'Partial (XML parsing)'},
                'Custom': {'supported': False, 'notes': 'Requires adapter'},
            },
        }


if __name__ == '__main__':
    import json
    print(json.dumps(FormatDetector.coverage_statement(), indent=2))
