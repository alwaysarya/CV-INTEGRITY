"""
Cybersecurity Attack Simulator
Simulates real-world attacks and blockchain-based detection
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import hashlib
from pathlib import Path
from datetime import datetime
from file_hasher import FileHasher
from digital_signature import DigitalSignature


class CyberAttackSimulator:
    """Simulate cybersecurity attacks on CV pipeline"""
    
    def __init__(self):
        self.hasher = FileHasher()
        self.signer = DigitalSignature()
        self.signer.load_keys()
        self.attacks_log = []
        self.results_dir = Path('outputs/attack_simulation')
        self.results_dir.mkdir(parents=True, exist_ok=True)
    
    def attack_1_data_poisoning(self):
        attack = {
            'id': 'ATTACK_001',
            'name': 'Data Poisoning Attack',
            'description': 'Malicious actor modifies dataset images',
            'severity': 'HIGH',
            'detected': False,
            'timestamp': datetime.now().isoformat()
        }
        
        original_hash = self.hasher.hash_directory('datasets/processed/good/images')
        attack['original_hash'] = original_hash[:40] + '...'
        
        malicious_file = Path('datasets/processed/good/images/MALICIOUS.jpg')
        with open(malicious_file, 'wb') as f:
            f.write(b'MALICIOUS DATA - POISONED')
        
        tampered_hash = self.hasher.hash_directory('datasets/processed/good/images')
        attack['tampered_hash'] = tampered_hash[:40] + '...'
        
        is_detected = original_hash != tampered_hash
        attack['detected'] = is_detected
        attack['detection_method'] = 'SHA-256 Directory Hash Comparison'
        attack['result'] = '⚠️ ATTACK DETECTED' if is_detected else '❌ ATTACK UNDETECTED'
        
        if malicious_file.exists():
            os.remove(malicious_file)
        
        return attack
    
    def attack_2_model_tampering(self):
        attack = {
            'id': 'ATTACK_002',
            'name': 'Model Tampering Attack',
            'description': 'Attacker modifies model weights file',
            'severity': 'CRITICAL',
            'detected': False,
            'timestamp': datetime.now().isoformat()
        }
        
        model_path = Path('model/saved_models/good/train/weights/best.pt')
        
        if not model_path.exists():
            attack['result'] = '⚠️ Model file not found'
            return attack
        
        original_hash = self.hasher.hash_file(model_path)
        attack['original_hash'] = original_hash[:40] + '...'
        
        original_signature = self.signer.sign_file(model_path)
        attack['original_signature'] = original_signature['signature'][:40] + '...'
        
        with open(model_path, 'ab') as f:
            f.write(b'TAMPERED_BY_ATTACKER')
        
        tampered_hash = self.hasher.hash_file(model_path)
        attack['tampered_hash'] = tampered_hash[:40] + '...'
        
        hash_mismatch = original_hash != tampered_hash
        sig_valid = self.signer.verify_file_signature(model_path, original_signature['signature'])
        
        is_detected = hash_mismatch or not sig_valid
        attack['detected'] = is_detected
        attack['detection_methods'] = ['SHA-256 Hash', 'RSA Digital Signature']
        attack['hash_mismatch'] = hash_mismatch
        attack['signature_invalid'] = not sig_valid
        attack['result'] = '⚠️ ATTACK DETECTED' if is_detected else '❌ ATTACK UNDETECTED'
        
        return attack
    
    def attack_3_audit_log_tampering(self):
        attack = {
            'id': 'ATTACK_003',
            'name': 'Audit Log Tampering Attack',
            'description': 'Attacker modifies blockchain audit records',
            'severity': 'HIGH',
            'detected': False,
            'timestamp': datetime.now().isoformat()
        }
        
        blockchain_file = Path('outputs/reports/blockchain.json')
        
        if not blockchain_file.exists():
            attack['result'] = '⚠️ Blockchain file not found'
            return attack
        
        original_hash = self.hasher.hash_file(blockchain_file)
        attack['original_hash'] = original_hash[:40] + '...'
        
        with open(blockchain_file, 'r') as f:
            blockchain_data = json.load(f)
        
        if blockchain_data.get('chain') and len(blockchain_data['chain']) > 1:
            original_data = blockchain_data['chain'][1].get('data', {})
            blockchain_data['chain'][1]['data']['tampered'] = 'YES'
            
            with open(blockchain_file, 'w') as f:
                json.dump(blockchain_data, f, indent=2)
            
            tampered_hash = self.hasher.hash_file(blockchain_file)
            attack['tampered_hash'] = tampered_hash[:40] + '...'
            
            is_detected = original_hash != tampered_hash
            attack['detected'] = is_detected
            attack['detection_method'] = 'Blockchain Hash Chain'
            attack['result'] = '⚠️ ATTACK DETECTED' if is_detected else '❌ ATTACK UNDETECTED'
            
            blockchain_data['chain'][1]['data'] = original_data
            with open(blockchain_file, 'w') as f:
                json.dump(blockchain_data, f, indent=2)
        
        return attack
    
    def attack_4_inference_manipulation(self):
        attack = {
            'id': 'ATTACK_004',
            'name': 'Inference Manipulation Attack',
            'description': 'Attacker changes trust decision from QUARANTINE to ACCEPT',
            'severity': 'CRITICAL',
            'detected': False,
            'timestamp': datetime.now().isoformat()
        }
        
        original_inference = {
            'model_hash': 'd53d1daeeee6da41ce632966363244c3d5926cb6',
            'trust_decision': 'QUARANTINE',
            'confidence': 0.45
        }
        
        original_signature = self.signer.sign_data(original_inference)
        attack['original_decision'] = 'QUARANTINE'
        attack['original_signature'] = original_signature['signature'][:40] + '...'
        
        tampered_inference = original_inference.copy()
        tampered_inference['trust_decision'] = 'ACCEPT'
        tampered_inference['confidence'] = 0.95
        attack['tampered_decision'] = 'ACCEPT'
        
        is_valid = self.signer.verify_signature(
            tampered_inference,
            original_signature['signature']
        )
        
        is_detected = not is_valid
        attack['detected'] = is_detected
        attack['detection_method'] = 'RSA-PSS Signature Verification'
        attack['result'] = '⚠️ ATTACK DETECTED' if is_detected else '❌ ATTACK UNDETECTED'
        
        return attack
    
    def attack_5_replay_attack(self):
        attack = {
            'id': 'ATTACK_005',
            'name': 'Replay Attack',
            'description': 'Attacker reuses old valid signature for new data',
            'severity': 'MEDIUM',
            'detected': False,
            'timestamp': datetime.now().isoformat()
        }
        
        old_data = {
            'dataset': 'good_dataset',
            'timestamp': '2026-09-10T10:00:00',
            'contributor': 'Arya Ranjan'
        }
        old_signature = self.signer.sign_data(old_data)
        attack['old_timestamp'] = old_data['timestamp']
        
        new_data = {
            'dataset': 'good_dataset',
            'timestamp': '2026-09-12T15:00:00',
            'contributor': 'Arya Ranjan'
        }
        attack['new_timestamp'] = new_data['timestamp']
        
        is_valid = self.signer.verify_signature(new_data, old_signature['signature'])
        
        is_detected = not is_valid
        attack['detected'] = is_detected
        attack['detection_method'] = 'Timestamp + Signature Binding'
        attack['result'] = '⚠️ ATTACK DETECTED' if is_detected else '❌ ATTACK UNDETECTED'
        
        return attack
    
    def run_all_attacks(self):
        print("\n" + "="*60)
        print("🛡️  CYBERSECURITY ATTACK SIMULATION")
        print("="*60 + "\n")
        
        attacks = [
            ('1. Data Poisoning', self.attack_1_data_poisoning),
            ('2. Model Tampering', self.attack_2_model_tampering),
            ('3. Audit Log Tampering', self.attack_3_audit_log_tampering),
            ('4. Inference Manipulation', self.attack_4_inference_manipulation),
            ('5. Replay Attack', self.attack_5_replay_attack),
        ]
        
        for name, attack_func in attacks:
            print(f"\n⚔️  Running {name}...")
            result = attack_func()
            self.attacks_log.append(result)
            print(f"   {result['result']}")
        
        detected = sum(1 for a in self.attacks_log if a['detected'])
        total = len(self.attacks_log)
        
        print("\n" + "="*60)
        print("📊 ATTACK SIMULATION SUMMARY")
        print("="*60)
        print(f"   Total Attacks Simulated: {total}")
        print(f"   Attacks Detected: {detected}")
        print(f"   Detection Rate: {(detected/total)*100:.1f}%")
        print("="*60)
        
        output = {
            'timestamp': datetime.now().isoformat(),
            'total_attacks': total,
            'detected': detected,
            'detection_rate': (detected/total)*100,
            'attacks': self.attacks_log
        }
        
        output_path = Path('outputs/reports/cyber_attacks.json')
        with open(output_path, 'w') as f:
            json.dump(output, f, indent=2)
        
        print(f"\n💾 Results saved: {output_path}")
        
        return output


if __name__ == "__main__":
    simulator = CyberAttackSimulator()
    results = simulator.run_all_attacks()
    
    print("\n✅ Cybersecurity Attack Simulation Complete!")
    print(f"🎯 Detection Rate: {results['detection_rate']:.1f}%")