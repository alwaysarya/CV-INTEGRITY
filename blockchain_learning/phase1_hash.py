"""
PHASE 1: Hash Function
The foundation of blockchain technology.
"""

import hashlib
import json


def sha256_hash(data):
    """Generate SHA-256 hash of any input."""
    if isinstance(data, dict):
        data = json.dumps(data, sort_keys=True)
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.sha256(data).hexdigest()


def sha256_hash_file(filepath):
    """Generate SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            sha256.update(chunk)
    return sha256.hexdigest()


def demo_basic_hash():
    print("\n" + "=" * 70)
    print("DEMO 1: BASIC HASH GENERATION")
    print("=" * 70)
    text = "Hello Blockchain"
    hash_value = sha256_hash(text)
    print(f"Input:  {text}")
    print(f"Hash:   {hash_value}")
    print(f"Length: {len(hash_value)} characters")


def demo_deterministic():
    print("\n" + "=" * 70)
    print("DEMO 2: DETERMINISTIC BEHAVIOR")
    print("=" * 70)
    text = "CV-INTEGRITY"
    for i in range(3):
        h = sha256_hash(text)
        print(f"Attempt {i+1}: {h}")
    print("\nObservation: Same input always produces identical hash.")


def demo_avalanche_effect():
    print("\n" + "=" * 70)
    print("DEMO 3: AVALANCHE EFFECT")
    print("=" * 70)
    h1 = sha256_hash("Hello")
    h2 = sha256_hash("Hello!")
    print(f"'Hello'  -> {h1}")
    print(f"'Hello!' -> {h2}")
    print(f"\nSame? {h1 == h2}")
    print("Observation: One character change = completely different hash.")


def demo_dict_hashing():
    print("\n" + "=" * 70)
    print("DEMO 4: HASHING STRUCTURED DATA")
    print("=" * 70)
    data = {"dataset": "ImageNet-1K", "images": 1000000, "version": "1.0"}
    h = sha256_hash(data)
    print(f"Data:  {data}")
    print(f"Hash:  {h}")
    data["images"] = 1000001
    h2 = sha256_hash(data)
    print(f"\nAfter changing images to 1000001:")
    print(f"Hash:  {h2}")
    print(f"Same? {h == h2}")


def demo_verify_integrity():
    print("\n" + "=" * 70)
    print("DEMO 5: DATA INTEGRITY VERIFICATION")
    print("=" * 70)
    original = "Important dataset content"
    original_hash = sha256_hash(original)
    print(f"Original data: {original}")
    print(f"Stored hash:   {original_hash}")
    retrieved = "Important dataset content"
    retrieved_hash = sha256_hash(retrieved)
    print(f"\nRetrieved data: {retrieved}")
    print(f"Retrieved hash: {retrieved_hash}")
    print(f"\nIntegrity: {'VALID' if original_hash == retrieved_hash else 'TAMPERED'}")
    tampered = "Important dataset CONTENT"
    tampered_hash = sha256_hash(tampered)
    print(f"\n--- Tampering simulation ---")
    print(f"Tampered data: {tampered}")
    print(f"Tampered hash: {tampered_hash}")
    print(f"Integrity: {'VALID' if original_hash == tampered_hash else 'TAMPERED'}")


def demo_nonce_search():
    print("\n" + "=" * 70)
    print("DEMO 6: NONCE SEARCH (MINING PREVIEW)")
    print("=" * 70)
    prefix = "00"
    nonce = 0
    print(f"Goal: Find nonce so hash starts with '{prefix}'")
    print("Searching...\n")
    while True:
        data = f"Block data + nonce={nonce}"
        h = sha256_hash(data)
        if h.startswith(prefix):
            print(f"Found!")
            print(f"Nonce: {nonce}")
            print(f"Hash:  {h}")
            print(f"Attempts: {nonce + 1}")
            break
        nonce += 1
        if nonce % 10 == 0:
            print(f"  Tried {nonce} nonces... current hash: {h[:16]}...")


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("PHASE 1: HASH FUNCTION - BLOCKCHAIN FOUNDATION")
    print("=" * 70)
    demo_basic_hash()
    demo_deterministic()
    demo_avalanche_effect()
    demo_dict_hashing()
    demo_verify_integrity()
    demo_nonce_search()
    print("\n" + "=" * 70)
    print("PHASE 1 COMPLETE")
    print("=" * 70)
    print("""
Key Learnings:
  1. SHA-256 produces 64-character hash
  2. Same input = Same hash (deterministic)
  3. One character change = Completely different hash
  4. Works on strings, dicts, and files
  5. Used to verify data integrity
  6. Nonce search = foundation of mining
""")
