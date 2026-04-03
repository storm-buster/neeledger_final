import hashlib
import sys


def generate_sha256(data: str) -> str:
    
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def generate_sha512(data: str) -> str:
    
    return hashlib.sha512(data.encode("utf-8")).hexdigest()


def generate_blake2b(data: str) -> str:
   
    return hashlib.blake2b(data.encode("utf-8")).hexdigest()


def generate_combined_hash(unique_id: str) -> dict:
    
    sha256_hash = generate_sha256(unique_id)
    sha512_hash = generate_sha512(unique_id)
    blake2b_hash = generate_blake2b(unique_id)

    
    concatenated = sha256_hash + sha512_hash + blake2b_hash

    
    combined_hash = hashlib.sha256(concatenated.encode("utf-8")).hexdigest()

    return {
        "unique_id": unique_id,
        "sha256": sha256_hash,
        "sha512": sha512_hash,
        "blake2b": blake2b_hash,
        "combined_hash": combined_hash,
    }


def print_result(result: dict) -> None:
    """Pretty-print the hash result."""
    print("\n" + "=" * 70)
    print("  COMBINED HASH GENERATOR")
    print("=" * 70)
    print(f"\n  Input Unique ID : {result['unique_id']}")
    print(f"\n  SHA-256         : {result['sha256']}")
    print(f"\n  SHA-512         : {result['sha512']}")
    print(f"\n  BLAKE2b         : {result['blake2b']}")
    print(f"\n  ── COMBINED HASH ──")
    print(f"  {result['combined_hash']}")
    print("\n" + "=" * 70 + "\n")


if __name__ == "__main__":
    if len(sys.argv) > 1:
    
        uid = sys.argv[1]
    else:
        
        uid = input("Enter the Supabase unique ID: ").strip()

    if not uid:
        print("Error: unique ID cannot be empty.")
        sys.exit(1)

    result = generate_combined_hash(uid)
    print_result(result)
