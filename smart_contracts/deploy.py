"""
Deploy script for Donation Transparency Smart Contract
Deploys to Algorand TestNet
"""

import os
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import ApplicationCreateTxn, OnComplete, StateSchema, wait_for_confirmation
from algosdk.logic import get_application_address
from dotenv import load_dotenv
import base64

load_dotenv()


def get_algod_client():
    """Create Algod client for TestNet"""
    algod_address = "https://testnet-api.algonode.cloud"
    algod_token = ""
    return algod.AlgodClient(algod_token, algod_address)


def compile_program(client, source_code):
    """Compile TEAL source code"""
    compile_response = client.compile(source_code)
    return base64.b64decode(compile_response['result'])


def deploy_contract(creator_mnemonic):
    """
    Deploy the donation transparency smart contract
    
    Args:
        creator_mnemonic: 25-word mnemonic of deployer account
        
    Returns:
        app_id: The deployed application ID
    """
    # Initialize client
    client = get_algod_client()
    print("✓ Connected to Algorand TestNet")
    
    # Get creator account from mnemonic
    creator_private_key = mnemonic.to_private_key(creator_mnemonic)
    creator_address = account.address_from_private_key(creator_private_key)
    
    print(f"✓ Deploying from: {creator_address}")
    
    # Check balance
    try:
        account_info = client.account_info(creator_address)
        balance = account_info.get('amount', 0) / 1_000_000
        print(f"✓ Account balance: {balance} ALGO")
        if balance < 0.5:
            print("⚠️  Warning: Low balance. You need at least 0.5 ALGO to deploy.")
            return None
    except Exception as e:
        print(f"⚠️  Could not check balance: {e}")
    
    # Read TEAL files
    print("⏳ Reading TEAL files...")
    with open("approval.teal", "r") as f:
        approval_program_source = f.read()
    
    with open("clear.teal", "r") as f:
        clear_program_source = f.read()
    print("✓ TEAL files loaded")
    
    # Compile programs
    print("⏳ Compiling programs...")
    approval_program = compile_program(client, approval_program_source)
    clear_program = compile_program(client, clear_program_source)
    print("✓ Programs compiled")
    
    # Define schema
    global_schema = StateSchema(
        num_uints=4,  # total_donations, donation_count, ngo_count, admin
        num_byte_slices=1  # last_donor
    )
    
    local_schema = StateSchema(
        num_uints=4,  # donor_total, ngo_registered, ngo_approved, campaign_count
        num_byte_slices=2  # ngo_name, ngo_description
    )
    
    # Get suggested params
    params = client.suggested_params()
    print("✓ Network parameters obtained")
    
    # Create application transaction
    print("⏳ Creating application transaction...")
    txn = ApplicationCreateTxn(
        sender=creator_address,
        sp=params,
        on_complete=OnComplete.NoOpOC,
        approval_program=approval_program,
        clear_program=clear_program,
        global_schema=global_schema,
        local_schema=local_schema,
        extra_pages=3  # For box storage
    )
    print("✓ Transaction created")
    
    # Sign transaction
    print("⏳ Signing transaction...")
    signed_txn = txn.sign(creator_private_key)
    print("✓ Transaction signed")
    
    # Send transaction
    tx_id = client.send_transaction(signed_txn)
    print(f"✓ Transaction sent with ID: {tx_id}")
    print("⏳ Waiting for confirmation (this may take 5-15 seconds)...")
    
    # Wait for confirmation
    try:
        confirmed_txn = wait_for_confirmation(client, tx_id, 10)
        print(f"✓ Transaction confirmed in round {confirmed_txn['confirmed-round']}")
        
        # Get app ID
        app_id = confirmed_txn["application-index"]
        app_address = get_application_address(app_id)
        
        print("\n" + "="*50)
        print("✅ CONTRACT DEPLOYED SUCCESSFULLY!")
        print("="*50)
        print(f"App ID: {app_id}")
        print(f"App Address: {app_address}")
        print("\n📝 Next steps:")
        print(f"1. Fund the app address with TestNet ALGO:")
        print(f"   {app_address}")
        print(f"2. Update frontend/.env with:")
        print(f"   VITE_APP_ID={app_id}")
        print(f"3. Update frontend/.env with your admin address:")
        print(f"   VITE_ADMIN_ADDRESS={creator_address}")
        print("="*50)
        
        return app_id
        
    except Exception as e:
        print(f"Error waiting for confirmation: {e}")
        return None


if __name__ == "__main__":
    print("="*50)
    print("Algorand Donation Transparency Contract Deployment")
    print("="*50)
    print("\n⚠️  Make sure you have:")
    print("  1. Compiled TEAL files (approval.teal, clear.teal)")
    print("  2. TestNet account with at least 1 ALGO")
    print("  3. Account mnemonic ready\n")
    
    # Get mnemonic from user
    creator_mnemonic = input("Enter your 25-word mnemonic (or press Enter to use .env): ").strip()
    
    if not creator_mnemonic:
        # Try to load from .env
        creator_mnemonic = os.getenv("DEPLOYER_MNEMONIC")
        if not creator_mnemonic:
            print("❌ No mnemonic provided. Please set DEPLOYER_MNEMONIC in .env or enter manually.")
            exit(1)
    
    # Deploy
    deploy_contract(creator_mnemonic)
