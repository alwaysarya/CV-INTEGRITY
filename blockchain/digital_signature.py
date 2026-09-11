"""
Digital Signature System
RSA-based signatures for data, models, and inference outputs
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import hashlib
from pathlib import Path
from datetime import datetime

try:
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa, padding
    from cryptography.hazmat.backends import default_backend
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False


class DigitalSignature:
    """RSA-based digital signature system"""
    
    def __init__(self, keys_dir='blockchain/keys'):
        self.keys_dir = Path(keys_dir)
        self.keys_dir.mkdir(parents=True, exist_ok=True)
        self.private_key = None
        self.public_key = None
    
    def generate_keys(self, key_size=2048):
        if not CRYPTO_AVAILABLE:
            return None
        print(f"🔐 Generating {key_size}-bit RSA keys...")
        self.private_key = rsa.generate_private_key(
            public_exponent=65537, key_size=key_size, backend=default_backend()
        )
        self.public_key = self.private_key.public_key()
        private_pem = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        public_pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        with open(self.keys_dir / 'private_key.pem', 'wb') as f:
            f.write(private_pem)
        with open(self.keys_dir / 'public_key.pem', 'wb') as f:
            f.write(public_pem)
        print(f"✅ Keys saved to {self.keys_dir}/")
        return True
    
    def load_keys(self):
        if not CRYPTO_AVAILABLE:
            return False
        private_path = self.keys_dir / 'private_key.pem'
        public_path = self.keys_dir / 'public_key.pem'
        if not private_path.exists() or not public_path.exists():
            return False
        with open(private_path, 'rb') as f:
            self.private_key = serialization.load_pem_private_key(
                f.read(), password=None, backend=default_backend()
            )
        with open(public_path, 'rb') as f:
            self.public_key = serialization.load_pem_public_key(
                f.read(), backend=default_backend()
            )
        return True
    
    def sign_data(self, data):
        if not CRYPTO_AVAILABLE or not self.private_key:
            return None
        if isinstance(data, dict):
            data_bytes = json.dumps(data, sort_keys=True).encode()
        elif isinstance(data, str):
            data_bytes = data.encode()
        else:
            data_bytes = str(data).encode()
        signature = self.private_key.sign(
            data_bytes,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256()
        )
        return {
            'signature': signature.hex(),
            'data_hash': hashlib.sha256(data_bytes).hexdigest(),
            'algorithm': 'RSA-PSS-SHA256',
            'timestamp': datetime.now().isoformat()
        }
    
    def verify_signature(self, data, signature_hex):
        if not CRYPTO_AVAILABLE or not self.public_key:
            return False
        try:
            if isinstance(data, dict):
                data_bytes = json.dumps(data, sort_keys=True).encode()
            elif isinstance(data, str):
                data_bytes = data.encode()
            else:
                data_bytes = str(data).encode()
            signature = bytes.fromhex(signature_hex)
            self.public_key.verify(
                signature, data_bytes,
                padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
                hashes.SHA256()
            )
            return True
        except:
            return False
    
    def sign_file(self, filepath):
        filepath = Path(filepath)
        if not filepath.exists():
            return None
        sha256 = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
        file_hash = sha256.hexdigest()
        signature = self.private_key.sign(
            file_hash.encode(),
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256()
        )
        return {
            'file': str(filepath),
            'file_hash': file_hash,
            'signature': signature.hex(),
            'algorithm': 'RSA-PSS-SHA256',
            'timestamp': datetime.now().isoformat()
        }
    
    def verify_file_signature(self, filepath, signature_hex):
        filepath = Path(filepath)
        if not filepath.exists():
            return False
        sha256 = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                sha256.update(chunk)
        file_hash = sha256.hexdigest()
        try:
            signature = bytes.fromhex(signature_hex)
            self.public_key.verify(
                signature, file_hash.encode(),
                padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
                hashes.SHA256()
            )
            return True
        except:
            return False