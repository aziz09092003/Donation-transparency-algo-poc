"""
Algorand Donation Transparency Smart Contract
PyTeal implementation for NGO donation platform with admin controls
"""

from pyteal import *


def approval_program():
    """
    Main approval program for donation transparency dApp
    
    Global State:
    - total_donations: Total ALGO donated across all NGOs
    - donation_count: Number of donations made
    - ngo_count: Total registered NGOs
    - last_donor: Address of last donor
    - admin: Admin wallet address
    
    Local State (per user):
    - donor_total: Total donated by this donor
    - ngo_registered: 1 if user is registered NGO, 0 otherwise
    - ngo_approved: 1 if NGO approved by admin, 0 otherwise
    - ngo_name: NGO name (bytes)
    - campaign_count: Number of campaigns created by NGO
    """
    
    # Global state keys
    total_donations_key = Bytes("total_donations")
    donation_count_key = Bytes("donation_count")
    ngo_count_key = Bytes("ngo_count")
    last_donor_key = Bytes("last_donor")
    admin_key = Bytes("admin")
    
    # Local state keys
    donor_total_key = Bytes("donor_total")
    ngo_registered_key = Bytes("ngo_registered")
    ngo_approved_key = Bytes("ngo_approved")
    ngo_name_key = Bytes("ngo_name")
    ngo_description_key = Bytes("ngo_description")
    campaign_count_key = Bytes("campaign_count")
    
    # Operations
    op_register_ngo = Bytes("register_ngo")
    op_approve_ngo = Bytes("approve_ngo")
    op_create_campaign = Bytes("create_campaign")
    op_donate = Bytes("donate")
    op_get_stats = Bytes("get_stats")
    
    # Initialize app
    on_creation = Seq([
        App.globalPut(total_donations_key, Int(0)),
        App.globalPut(donation_count_key, Int(0)),
        App.globalPut(ngo_count_key, Int(0)),
        App.globalPut(admin_key, Txn.sender()),  # Creator is admin
        Return(Int(1))
    ])
    
    # Register NGO
    # Args: ["register_ngo", ngo_name, ngo_description]
    register_ngo = Seq([
        # Check if already registered
        Assert(App.localGet(Txn.sender(), ngo_registered_key) == Int(0)),
        # Store NGO info in local state
        App.localPut(Txn.sender(), ngo_registered_key, Int(1)),
        App.localPut(Txn.sender(), ngo_approved_key, Int(0)),  # Pending approval
        App.localPut(Txn.sender(), ngo_name_key, Txn.application_args[1]),
        App.localPut(Txn.sender(), ngo_description_key, Txn.application_args[2]),
        App.localPut(Txn.sender(), campaign_count_key, Int(0)),
        # Increment global NGO count
        App.globalPut(ngo_count_key, App.globalGet(ngo_count_key) + Int(1)),
        Return(Int(1))
    ])
    
    # Approve NGO (admin only)
    # Args: ["approve_ngo", ngo_address]
    approve_ngo = Seq([
        # Only admin can approve
        Assert(Txn.sender() == App.globalGet(admin_key)),
        # Approve the NGO
        App.localPut(Txn.accounts[1], ngo_approved_key, Int(1)),
        Return(Int(1))
    ])
    
    # Create Campaign
    # Args: ["create_campaign", campaign_title, campaign_purpose, min_donation]
    # Campaign data stored in box storage with key: "campaign_{ngo_address}_{campaign_id}"
    create_campaign = Seq([
        # Check if NGO is approved
        Assert(App.localGet(Txn.sender(), ngo_registered_key) == Int(1)),
        Assert(App.localGet(Txn.sender(), ngo_approved_key) == Int(1)),
        # Increment campaign count
        App.localPut(
            Txn.sender(),
            campaign_count_key,
            App.localGet(Txn.sender(), campaign_count_key) + Int(1)
        ),
        # Store campaign in box storage
        # Format: campaign_{ngo}_{id} -> {title}|{purpose}|{min}|{total}
        App.box_put(
            Concat(
                Bytes("campaign_"),
                Txn.sender(),
                Bytes("_"),
                Itob(App.localGet(Txn.sender(), campaign_count_key))
            ),
            Concat(
                Txn.application_args[1],  # title
                Bytes("|"),
                Txn.application_args[2],  # purpose
                Bytes("|"),
                Txn.application_args[3],  # min_donation
                Bytes("|"),
                Bytes("0")  # initial total donations
            )
        ),
        Return(Int(1))
    ])
    
    # Donate
    # Args: ["donate", ngo_address, campaign_id]
    # Payment transaction must accompany this call
    donate = Seq([
        # Check payment transaction
        Assert(Gtxn[0].type_enum() == TxnType.Payment),
        Assert(Gtxn[0].receiver() == Global.current_application_address()),
        Assert(Gtxn[0].amount() > Int(0)),
        
        # Get NGO address from accounts array
        # ngo_address = Txn.accounts[1]
        
        # Update donor local state
        App.localPut(
            Gtxn[0].sender(),
            donor_total_key,
            App.localGet(Gtxn[0].sender(), donor_total_key) + Gtxn[0].amount()
        ),
        
        # Update global state
        App.globalPut(total_donations_key, App.globalGet(total_donations_key) + Gtxn[0].amount()),
        App.globalPut(donation_count_key, App.globalGet(donation_count_key) + Int(1)),
        App.globalPut(last_donor_key, Gtxn[0].sender()),
        
        Return(Int(1))
    ])
    
    # Opt-in: Initialize local state for user
    on_opt_in = Seq([
        App.localPut(Txn.sender(), donor_total_key, Int(0)),
        App.localPut(Txn.sender(), ngo_registered_key, Int(0)),
        App.localPut(Txn.sender(), ngo_approved_key, Int(0)),
        App.localPut(Txn.sender(), campaign_count_key, Int(0)),
        Return(Int(1))
    ])
    
    # Main program logic
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Int(0))],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Int(0))],
        [Txn.application_args[0] == op_register_ngo, register_ngo],
        [Txn.application_args[0] == op_approve_ngo, approve_ngo],
        [Txn.application_args[0] == op_create_campaign, create_campaign],
        [Txn.application_args[0] == op_donate, donate],
    )
    
    return program


def clear_state_program():
    """Clear state program - allows users to clear their local state"""
    return Return(Int(1))


if __name__ == "__main__":
    # Compile the programs
    approval_teal = compileTeal(approval_program(), mode=Mode.Application, version=8)
    clear_teal = compileTeal(clear_state_program(), mode=Mode.Application, version=8)
    
    # Write to files
    with open("approval.teal", "w") as f:
        f.write(approval_teal)
    
    with open("clear.teal", "w") as f:
        f.write(clear_teal)
    
    print("✅ TEAL programs compiled successfully!")
    print("   - approval.teal")
    print("   - clear.teal")
