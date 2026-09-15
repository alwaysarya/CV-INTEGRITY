"""
PHASE 6: Digital Signatures (RSA)
Authenticating transactions with public-key cryptography.
"""

import hashlib
import json
from typing import Tuple

# Try to import cryptography library
try:
    from cryptography.hazmat.primitives.asymmetric import rsa, padding
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.exceptions import InvalidSignature
    CRYPTO_OK = True
except ImportError:
    print("⚠️  cryptography library not installed.")
    print("   Install: pip install cryptography")
    CRYPTO_OK = False


# ============================================================
# SIMPLE RSA (Educational — NOT for production)
# ============================================================

def simple_hash_int(data: str, n: int) -> int:
    """Convert data to integer modulo n."""
    h = hashlib.sha256(data.encode()).hexdigest()
    return int(h, 16) % n


def mod_exp(base: int, exp: int, mod: int) -> int:
    """Modular exponentiation (base^exp mod mod)."""
    return pow(base, exp, mod)


def generate_simple_rsa_keys():
    """
    Generate simple RSA keys for educational purposes.
    NOTE: Uses small primes — NOT SECURE for real use!
    """
    # Small primes for demo (real RSA uses 1024+ bit primes)
    p = 61
    q = 53
    n = p * q           # 3233
    phi = (p - 1) * (q - 1)  # 3120
    
    # Choose e (public exponent)
    e = 17
    while phi % e == 0:
        e += 2
    
    # Compute d (private exponent)
    d = pow(e, -1, phi)
    
    return {
        'public': (e, n),
        'private': (d, n),
        'details': {'p': p, 'q': q, 'n': n, 'phi': phi, 'e': e, 'd': d}
    }


def simple_sign(message: str, private_key: Tuple[int, int]) -> int:
    """Sign message with private key."""
    d, n = private_key
    h = simple_hash_int(message, n)
    signature = mod_exp(h, d, n)
    return signature


def simple_verify(message: str, signature: int, public_key: Tuple[int, int]) -> bool:
    """Verify signature with public key."""
    e, n = public_key
    h_original = simple_hash_int(message, n)
    h_verified = mod_exp(signature, e, n)
    return h_original == h_verified


# ============================================================
# REAL RSA (Production-grade)
# ============================================================

class RealRSA:
    """Production-grade RSA using cryptography library."""
    
    @staticmethod
    def generate_keypair(key_size=2048):
        """Generate RSA key pair."""
        if not CRYPTO_OK:
            return None, None
        
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=key_size,
        )
        public_key = private_key.public_key()
        return private_key, public_key
    
    @staticmethod
    def sign(message: str, private_key) -> bytes:
        """Sign a message with private key."""
        if not CRYPTO_OK:
            return b''
        
        signature = private_key.sign(
            message.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return signature
    
    @staticmethod
    def verify(message: str, signature: bytes, public_key) -> bool:
        """Verify signature with public key."""
        if not CRYPTO_OK:
            return False
        
        try:
            public_key.verify(
                signature,
                message.encode(),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except InvalidSignature:
            return False


# ============================================================
# DEMONSTRATIONS
# ============================================================

def demo_simple_rsa():
    """Demo 1: Simple RSA (educational)"""
    print("\n" + "=" * 70)
    print("DEMO 1: SIMPLE RSA (EDUCATIONAL)")
    print("=" * 70)
    
    keys = generate_simple_rsa_keys()
    details = keys['details']
    
    print(f"\nKey generation details:")
    print(f"  p = {details['p']}")
    print(f"  q = {details['q']}")
    print(f"  n = p * q = {details['n']}")
    print(f"  φ(n) = {details['phi']}")
    print(f"  e (public) = {details['e']}")
    print(f"  d (private) = {details['d']}")
    print(f"\n  Public key:  (e={details['e']}, n={details['n']})")
    print(f"  Private key: (d={details['d']}, n={details['n']})")


def demo_sign_verify():
    """Demo 2: Sign and verify a message"""
    print("\n" + "=" * 70)
    print("DEMO 2: SIGN AND VERIFY MESSAGE")
    print("=" * 70)
    
    keys = generate_simple_rsa_keys()
    public_key = keys['public']
    private_key = keys['private']
    
    message = "Transfer 100 coins to Alice"
    print(f"\nMessage: {message}")
    
    # Sign
    signature = simple_sign(message, private_key)
    print(f"Signature: {signature}")
    
    # Verify (correct)
    is_valid = simple_verify(message, signature, public_key)
    print(f"\nVerification (original): {'✅ VALID' if is_valid else '❌ INVALID'}")
    
    # Verify (tampered message)
    tampered = "Transfer 10000 coins to Alice"
    is_valid_tampered = simple_verify(tampered, signature, public_key)
    print(f"Verification (tampered):  {'✅ VALID' if is_valid_tampered else '❌ INVALID'}")


def demo_real_rsa():
    """Demo 3: Production-grade RSA"""
    print("\n" + "=" * 70)
    print("DEMO 3: REAL RSA (PRODUCTION)")
    print("=" * 70)
    
    if not CRYPTO_OK:
        print("Skipping — cryptography library not installed")
        return
    
    print("\nGenerating 2048-bit RSA keypair...")
    private_key, public_key = RealRSA.generate_keypair(2048)
    print("✅ Keys generated")
    
    # Show key sizes
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    print(f"\nPrivate key size: {len(private_pem)} bytes")
    print(f"Public key size:  {len(public_pem)} bytes")
    
    # Sign
    message = "Blockchain transaction #12345"
    signature = RealRSA.sign(message, private_key)
    print(f"\nMessage:   {message}")
    print(f"Signature: {signature[:40].hex()}... ({len(signature)} bytes)")
    
    # Verify
    is_valid = RealRSA.verify(message, signature, public_key)
    print(f"\nVerification: {'✅ VALID' if is_valid else '❌ INVALID'}")
    
    # Tamper test
    tampered = message + " (modified)"
    is_valid_tampered = RealRSA.verify(tampered, signature, public_key)
    print(f"Tampered:     {'✅ VALID' if is_valid_tampered else '❌ INVALID'}")


def demo_blockchain_transaction():
    """Demo 4: Sign a blockchain transaction"""
    print("\n" + "=" * 70)
    print("DEMO 4: SIGN A BLOCKCHAIN TRANSACTION")
    print("=" * 70)
    
    if not CRYPTO_OK:
        print("Skipping — cryptography library not installed")
        return
    
    # Generate user keys
    print("\nGenerating user keypair...")
    private_key, public_key = RealRSA.generate_keypair(2048)
    
    # Create transaction
    transaction = {
        "from": "alice_address_0x1234",
        "to": "bob_address_0x5678",
        "amount": 100,
        "timestamp": "2026-09-15T14:30:00",
        "dataset_hash": "a1c37c7f58c33ab459376568ea82752f0632d0d3adfaba790ae9ac346ff0ca2"
    }
    
    print(f"\nTransaction:")
    print(json.dumps(transaction, indent=2))
    
    # Sign the transaction
    tx_string = json.dumps(transaction, sort_keys=True)
    signature = RealRSA.sign(tx_string, private_key)
    
    transaction['signature'] = signature.hex()
    print(f"\nSigned transaction signature: {signature.hex()[:60]}...")
    
    # Verify
    received_tx = {k: v for k, v in transaction.items() if k != 'signature'}
    received_string = json.dumps(received_tx, sort_keys=True)
    
    is_valid = RealRSA.verify(received_string, signature, public_key)
    print(f"\nVerification: {'✅ VALID' if is_valid else '❌ INVALID'}")
    
    # Tamper test
    tampered_tx = received_tx.copy()
    tampered_tx['amount'] = 10000
    tampered_string = json.dumps(tampered_tx, sort_keys=True)
    
    is_valid_tampered = RealRSA.verify(tampered_string, signature, public_key)
    print(f"Tampered amount (100 → 10000): {'✅ VALID' if is_valid_tampered else '❌ INVALID'}")


def demo_key_serialization():
    """Demo 5: Serialize keys for storage"""
    print("\n" + "=" * 70)
    print("DEMO 5: KEY SERIALIZATION")
    print("=" * 70)
    
    if not CRYPTO_OK:
        print("Skipping — cryptography library not installed")
        return
    
    private_key, public_key = RealRSA.generate_keypair(2048)
    
    # Serialize public key
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode()
    
    print("\nPublic Key (PEM format — shareable):")
    print(public_pem[:300] + "...")
    
    # Deserialize
    from cryptography.hazmat.primitives.serialization import load_pem_public_key
    loaded_public = load_pem_public_key(public_pem.encode())
    
    # Sign with private, verify with loaded public
    message = "test"
    signature = RealRSA.sign(message, private_key)
    is_valid = RealRSA.verify(message, signature, loaded_public)
    
    print(f"\nSign → Serialize → Load → Verify: {'✅ VALID' if is_valid else '❌ INVALID'}")


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("PHASE 6: DIGITAL SIGNATURES (RSA)")
    print("=" * 70)
    
    demo_simple_rsa()
    demo_sign_verify()
    demo_real_rsa()
    demo_blockchain_transaction()
    demo_key_serialization()
    
    print("\n" + "=" * 70)
    print("PHASE 6 COMPLETE")
    print("=" * 70)
    print("""
Key Learnings:
  1. Digital signature = message signed with private key
  2. Verification uses public key
  3. Tampered message → signature invalid
  4. RSA uses modular arithmetic (simple version) or large primes (real)
  5. Real RSA: 2048-bit keys, PSS padding, SHA-256
  6. Blockchain transactions are signed to prove ownership
  7. Keys can be serialized (PEM format) for storage
  8. Never share private key; public key is shareable
""")
