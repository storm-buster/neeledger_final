import os
import sys
import time

from dotenv import load_dotenv
from supabase import create_client, Client

from hash_generator import generate_combined_hash
from blockchain import Blockchain


load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

TABLE_NAME = "projects"
ID_COLUMN = "id"
NAME_COLUMN = "name"


def get_supabase_client() -> Client:
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_KEY must be set in .env")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_projects(client: Client) -> list[dict]:
    
    response = client.table(TABLE_NAME).select("*").execute()
    return response.data


def process_new_projects(client: Client, blockchain: Blockchain) -> int:
    
    projects = fetch_projects(client)
    already_hashed = blockchain.get_hashed_project_ids()
    new_count = 0

    for project in projects:
        project_id = str(project[ID_COLUMN])
        project_name = project.get(NAME_COLUMN, "Unknown")

        if project_id in already_hashed:
            continue

      
        result = generate_combined_hash(project_id)
        combined_hash = result["combined_hash"]

        
        block = blockchain.add_block(project_id, project_name, combined_hash)

        new_count += 1
        print(f"  ✓ Block #{block.index}")
        print(f"    Project  : {project_name} ({project_id})")
        print(f"    SHA-256  : {result['sha256'][:32]}...")
        print(f"    SHA-512  : {result['sha512'][:32]}...")
        print(f"    BLAKE2b  : {result['blake2b'][:32]}...")
        print(f"    Combined : {combined_hash}")
        print(f"    Block Hash: {block.block_hash}")
        print()

    return new_count


def run_once(client: Client, blockchain: Blockchain):
    
    print("\n── One-Shot Mode ──────────────────────────────────────────")
    print(f"  Fetching projects from Supabase table '{TABLE_NAME}'...\n")

    added = process_new_projects(client, blockchain)

    if added == 0:
        print("  No new projects found. Blockchain is up-to-date.\n")
    else:
        print(f"  Added {added} new block(s) to the blockchain.\n")

    blockchain.print_chain()


def run_watch(client: Client, blockchain: Blockchain, interval: int):
    
    print("\n── Watch Mode ─────────────────────────────────────────────")
    print(f"  Polling Supabase table '{TABLE_NAME}' every {interval}s")
    print("  Press Ctrl+C to stop.\n")

    try:
        while True:
            added = process_new_projects(client, blockchain)
            if added > 0:
                print(f"  [{time.strftime('%H:%M:%S')}] Added {added} new block(s).\n")
            else:
                print(f"  [{time.strftime('%H:%M:%S')}] No new projects.", end="\r")
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\n\n  Watch stopped.")
        blockchain.print_chain()


if __name__ == "__main__":
    print("=" * 70)
    print("  SUPABASE → HASH → BLOCKCHAIN PIPELINE")
    print("=" * 70)

    client = get_supabase_client()
    blockchain = Blockchain()

    if "--once" in sys.argv:
        
        run_once(client, blockchain)
    else:
    
        interval = int(sys.argv[1]) if len(sys.argv) > 1 else 10
        run_watch(client, blockchain, interval)
