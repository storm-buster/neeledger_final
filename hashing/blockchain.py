"""
blockchain.py — Local file-based blockchain
=============================================
Each block stores a project ID + its combined hash.
The chain is persisted as `blockchain.json`.
"""

import hashlib
import json
import os
from datetime import datetime, timezone


BLOCKCHAIN_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "blockchain.json")


class Block:
    """A single block in the chain."""

    def __init__(self, index: int, project_id: str, project_name: str,
                 combined_hash: str, previous_hash: str, timestamp: str = None):
        self.index = index
        self.timestamp = timestamp or datetime.now(timezone.utc).isoformat()
        self.project_id = project_id
        self.project_name = project_name
        self.combined_hash = combined_hash
        self.previous_hash = previous_hash
        self.block_hash = self._calculate_hash()

    def _calculate_hash(self) -> str:
        """SHA-256 hash of the block's contents (excluding block_hash itself)."""
        content = (
            str(self.index)
            + self.timestamp
            + self.project_id
            + self.project_name
            + self.combined_hash
            + self.previous_hash
        )
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "project_id": self.project_id,
            "project_name": self.project_name,
            "combined_hash": self.combined_hash,
            "previous_hash": self.previous_hash,
            "block_hash": self.block_hash,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Block":
        block = cls(
            index=data["index"],
            project_id=data["project_id"],
            project_name=data["project_name"],
            combined_hash=data["combined_hash"],
            previous_hash=data["previous_hash"],
            timestamp=data["timestamp"],
        )
        block.block_hash = data["block_hash"]
        return block


class Blockchain:
    """A simple blockchain that persists to a JSON file."""

    def __init__(self, filepath: str = BLOCKCHAIN_FILE):
        self.filepath = filepath
        self.chain: list[Block] = []
        if os.path.exists(self.filepath):
            self.load()
        else:
            self._create_genesis_block()
            self.save()

    # ── Genesis ───────────────────────────────────────────────────────
    def _create_genesis_block(self):
        genesis = Block(
            index=0,
            project_id="GENESIS",
            project_name="Genesis Block",
            combined_hash="0" * 64,
            previous_hash="0" * 64,
        )
        self.chain.append(genesis)

    # ── Add Block ─────────────────────────────────────────────────────
    def add_block(self, project_id: str, project_name: str, combined_hash: str) -> Block:
        """Append a new block to the chain and save."""
        previous = self.chain[-1]
        block = Block(
            index=previous.index + 1,
            project_id=project_id,
            project_name=project_name,
            combined_hash=combined_hash,
            previous_hash=previous.block_hash,
        )
        self.chain.append(block)
        self.save()
        return block

    # ── Validation ────────────────────────────────────────────────────
    def is_chain_valid(self) -> bool:
        """Walk the chain and verify every link."""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            # Recalculate the block hash
            if current.block_hash != current._calculate_hash():
                print(f"  ✗ Block {current.index}: hash mismatch (data tampered)")
                return False

            # Check the chain link
            if current.previous_hash != previous.block_hash:
                print(f"  ✗ Block {current.index}: previous_hash broken")
                return False

        return True

    # ── Persistence ───────────────────────────────────────────────────
    def save(self):
        data = [block.to_dict() for block in self.chain]
        with open(self.filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def load(self):
        with open(self.filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.chain = [Block.from_dict(b) for b in data]

    # ── Helpers ───────────────────────────────────────────────────────
    def get_hashed_project_ids(self) -> set[str]:
        """Return a set of project IDs already in the chain."""
        return {block.project_id for block in self.chain if block.project_id != "GENESIS"}

    def __len__(self):
        return len(self.chain)

    def print_chain(self):
        """Pretty-print the full blockchain."""
        print("\n" + "=" * 70)
        print("  BLOCKCHAIN LEDGER")
        print("=" * 70)
        for block in self.chain:
            d = block.to_dict()
            print(f"\n  Block #{d['index']}")
            print(f"  Timestamp     : {d['timestamp']}")
            print(f"  Project ID    : {d['project_id']}")
            print(f"  Project Name  : {d['project_name']}")
            print(f"  Combined Hash : {d['combined_hash']}")
            print(f"  Previous Hash : {d['previous_hash']}")
            print(f"  Block Hash    : {d['block_hash']}")
            print("  " + "-" * 66)
        valid = self.is_chain_valid()
        print(f"\n  Chain valid: {'✓ YES' if valid else '✗ NO'}")
        print("=" * 70 + "\n")


# ── Quick test ────────────────────────────────────────────────────────
if __name__ == "__main__":
    bc = Blockchain()
    bc.print_chain()
    print(f"Chain length: {len(bc)} blocks")
    print(f"Valid: {bc.is_chain_valid()}")
