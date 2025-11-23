# Algorand Donation Transparency dApp

A complete blockchain-based donation platform built on Algorand with full transparency, NGO management, and admin controls.

## Features

### For Donors
- Connect wallet via Pera Wallet
- Browse and search NGOs
- Donate ALGO to campaigns
- View donation history
- Track transparency metrics

### For NGOs
- Register NGO profile
- Create donation campaigns
- View donors and donations
- Update profile information
- Campaign management

### For Admins
- Approve/reject NGO registrations
- View all NGOs and donors
- Monitor platform statistics
- Manage campaigns

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Blockchain**: Algorand TestNet
- **Smart Contracts**: PyTeal
- **Wallet**: Pera Wallet
- **SDK**: Algorand JavaScript SDK

## Project Structure

```
algo_donate_transparancy/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # Algorand & API services
│   │   ├── context/       # React context (wallet)
│   │   └── utils/         # Helper functions
│   └── package.json
├── smart_contracts/       # PyTeal smart contracts
│   ├── donation_transparency.py
│   └── deploy.py
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.10+
- AlgoKit CLI
- Pera Wallet (mobile or browser extension)

### 1. Install AlgoKit

```powershell
pipx install algokit
```

### 2. Install Smart Contract Dependencies

```powershell
cd smart_contracts
pip install pyteal py-algorand-sdk python-dotenv
```

### 3. Deploy Smart Contract to TestNet

```powershell
cd smart_contracts
python deploy.py
```

Copy the deployed **App ID** and update `frontend/src/services/config.js`

### 4. Install Frontend Dependencies

```powershell
cd frontend
npm install
```

### 5. Configure Environment

Create `frontend/.env`:

```env
VITE_ALGOD_TOKEN=
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_APP_ID=YOUR_DEPLOYED_APP_ID
VITE_ADMIN_ADDRESS=YOUR_ADMIN_WALLET_ADDRESS
```

### 6. Run Frontend

```powershell
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Smart Contract Functions

- `register_ngo(name, description)` - Register new NGO
- `create_campaign(title, purpose, min_amount)` - Create donation campaign
- `donate(ngo_id, campaign_id, amount)` - Make donation
- `approve_ngo(ngo_id)` - Admin approves NGO (admin only)
- `get_stats(ngo_id)` - Get NGO statistics

## Usage

### As a Donor
1. Connect Pera Wallet
2. Browse NGOs on home page
3. Click NGO to view campaigns
4. Donate to a campaign
5. View donation history in dashboard

### As an NGO
1. Connect Pera Wallet
2. Register NGO profile
3. Wait for admin approval
4. Create campaigns
5. Monitor donations

### As an Admin
1. Connect with admin wallet
2. Access admin panel
3. Approve/reject NGO registrations
4. Monitor platform activity

## TestNet Funding

Get free TestNet ALGO from:
- [Algorand Dispenser](https://bank.testnet.algorand.network/)

## Security Notes

- All transactions happen on-chain
- Admin addresses are hardcoded in smart contract
- NGOs must be approved before creating campaigns
- Minimum donation amounts enforced by smart contract

## License

MIT
