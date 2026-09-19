"""
Attack Simulator - Orchestrates all attacks.
Reproducible methods to introduce poisoning, backdoor, substitution, tampering.
"""

import json
import time
from pathlib import Path
from datetime import datetime

# Import attack modules
try:
    from .attacks import blur_attack, noise_attack, brightness_attack, contrast_attack
    from .attacks import duplicate_attack, rotation_attack, label_attack
except ImportError:
    import sys
    sys.path.insert(0, str(Path(__file__).parent))
    from attacks import blur_attack, noise_attack, brightness_attack, contrast_attack
    from attacks import duplicate_attack, rotation_attack, label_attack


class AttackSimulator:
    """Simulate representative attacks on datasets."""
    
    def __init__(self, output_dir='attack_simulator/results'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.attacks_log = []
    
    def run_blur_attack(self, image_path):
        output = self.output_dir / f"{Path(image_path).stem}_blur.jpg"
        result = blur_attack.apply(image_path, output)
        self._log('BLUR', image_path, result)
        return result
    
    def run_noise_attack(self, image_path):
        output = self.output_dir / f"{Path(image_path).stem}_noise.jpg"
        result = noise_attack.apply(image_path, output)
        self._log('NOISE', image_path, result)
        return result
    
    def run_brightness_attack(self, image_path):
        output = self.output_dir / f"{Path(image_path).stem}_bright.jpg"
        result = brightness_attack.apply(image_path, output)
        self._log('BRIGHTNESS', image_path, result)
        return result
    
    def run_contrast_attack(self, image_path):
        output = self.output_dir / f"{Path(image_path).stem}_contrast.jpg"
        result = contrast_attack.apply(image_path, output)
        self._log('CONTRAST', image_path, result)
        return result
    
    def run_rotation_attack(self, image_path):
        output = self.output_dir / f"{Path(image_path).stem}_rotated.jpg"
        result = rotation_attack.apply(image_path, output)
        self._log('ROTATION', image_path, result)
        return result
    
    def run_duplicate_attack(self, image_path):
        output = self.output_dir / f"{Path(image_path).stem}_copy.jpg"
        result = duplicate_attack.apply(image_path, output, count=3)
        self._log('DUPLICATE', image_path, result)
        return result
    
    def run_all_attacks(self, image_path):
        """Run all attacks on a single image."""
        print(f"\n🎯 Running all attacks on: {image_path}")
        results = {}
        
        for attack_name, func in [
            ('blur', self.run_blur_attack),
            ('noise', self.run_noise_attack),
            ('brightness', self.run_brightness_attack),
            ('contrast', self.run_contrast_attack),
            ('rotation', self.run_rotation_attack),
            ('duplicate', self.run_duplicate_attack),
        ]:
            try:
                result = func(image_path)
                results[attack_name] = {
                    'status': 'SUCCESS',
                    'output': str(result) if result else None,
                }
                print(f"  ✅ {attack_name}: {result}")
            except Exception as e:
                results[attack_name] = {
                    'status': 'FAILED',
                    'error': str(e),
                }
                print(f"  ❌ {attack_name}: {e}")
        
        return results
    
    def _log(self, attack_type, input_path, output_path):
        self.attacks_log.append({
            'attack_type': attack_type,
            'input': str(input_path),
            'output': str(output_path) if output_path else None,
            'timestamp': datetime.utcnow().isoformat(),
        })
    
    def save_report(self):
        """Save attack report."""
        report_file = self.output_dir / 'attack_impact_report.json'
        with open(report_file, 'w') as f:
            json.dump({
                'simulator': 'AttackSimulator',
                'generated_at': datetime.utcnow().isoformat(),
                'total_attacks': len(self.attacks_log),
                'attacks': self.attacks_log,
            }, f, indent=2, default=str)
        return str(report_file)


if __name__ == '__main__':
    sim = AttackSimulator()
    print("Attack Simulator ready")
    print(f"Output dir: {sim.output_dir}")
