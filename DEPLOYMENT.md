# Deployment Guide - Algorand Donation Transparency dApp

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Python 3.10+** - [Download](https://www.python.org/downloads/)
3. **Pera Wallet** - [Get it](https://perawallet.app/)
4. **TestNet ALGO** - [Algorand Dispenser](https://bank.testnet.algorand.network/)

## Step 1: Clone & Setup

```powershell
# Navigate to project directory
cd algo_donate_transparancy

# Install frontend dependencies
cd frontend
npm install

# Install smart contract dependencies
cd ..\smart_contracts
pip install -r requirements.txt
```

## Step 2: Prepare Smart Contract

### Compile the Smart Contract

```powershell
cd smart_contracts
python donation_transparency.py
```

This generates:
- `approval.teal` - Main contract logic
- `clear.teal` - Clear state program

### Get TestNet ALGO

1. Create a wallet in Pera Wallet app
2. Copy your wallet address
3. Visit [Algorand Dispenser](https://bank.testnet.algorand.network/)
4. Enter your address and get free TestNet ALGO

## Step 3: Deploy Smart Contract

### Configure Environment

Create `.env` in `smart_contracts/` folder:

```
DEPLOYER_MNEMONIC=your 25 word mnemonic here
```

⚠️ **NEVER commit this file to git!**

### Deploy

```powershell
cd smart_contracts
python deploy.py
```

**Save the output!** You'll need:
- **App ID** (e.g., 12345678)
- **App Address** (e.g., ABCD...XYZ)

### Fund the App

The smart contract needs ALGO to pay for transactions:

```powershell
# Send 5 ALGO to the app address
# Use Pera Wallet to send from your account
```

## Step 4: Configure Frontend

### Create `.env` file

Create `frontend/.env`:

```env
VITE_ALGOD_TOKEN=
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_INDEXER_SERVER=https://testnet-idx.algonode.cloud
VITE_INDEXER_PORT=443

# Replace with your deployed App ID
VITE_APP_ID=12345678

# Replace with your admin wallet address
VITE_ADMIN_ADDRESS=YOUR_WALLET_ADDRESS_HERE
```

## Step 5: Run the Application

```powershell
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Step 6: Test the Application

### As a Donor

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Approve in Pera Wallet app

2. **Opt-in**
   - Click "Opt-In to App" on home page
   - Approve transaction in Pera Wallet

3. **Browse NGOs**
   - View approved NGOs on home page
   - Click to see campaigns

4. **Make Donation**
   - Select a campaign
   - Enter amount (minimum 1 ALGO)
   - Click "Donate Now"
   - Approve in Pera Wallet

5. **View Dashboard**
   - Click "Dashboard" in navbar
   - See your donation history

### As an NGO

1. **Connect & Opt-in** (same as donor)

2. **Register NGO**
   - Go to "NGO Panel"
   - Fill in NGO name and description
   - Click "Register NGO"
   - Approve transaction

3. **Wait for Approval**
   - Admin must approve your NGO
   - Status shown on NGO Panel

4. **Create Campaign** (after approval)
   - Click "Create Campaign"
   - Fill in title, purpose, min donation
   - Submit and approve transaction

5. **Monitor Donations**
   - View campaigns on NGO Panel
   - See donation totals

### As an Admin

1. **Connect with Admin Wallet**
   - Use the wallet address from `.env`

2. **Access Admin Panel**
   - Click "Admin" in navbar

3. **Approve NGOs**
   - See pending NGO registrations
   - Click "Approve" button
   - Confirm transaction

4. **Monitor Platform**
   - View total donations
   - See all NGOs and donors
   - Track recent activity

## Troubleshooting

### "App not found" error
- Check `VITE_APP_ID` in `frontend/.env`
- Ensure contract is deployed

### Transaction failed
- Check wallet has sufficient ALGO
- Ensure you've opted into the app
- Verify app address has funds

### NGO not showing
- Wait for admin approval
- Check transaction confirmed on TestNet
- Refresh the page

### Pera Wallet won't connect
- Update Pera Wallet to latest version
- Ensure you're on TestNet in wallet settings
- Clear browser cache

## Network Information

- **Network**: Algorand TestNet
- **Algod API**: https://testnet-api.algonode.cloud
- **Indexer API**: https://testnet-idx.algonode.cloud
- **Explorer**: https://testnet.algoexplorer.io

## Security Notes

1. **Never share your mnemonic**
2. **Use TestNet only** - This is a POC
3. **Admin address** is hardcoded in contract
4. **Smart contract** is immutable after deployment
5. **All data** is public on blockchain

## Production Deployment

For production:

1. Deploy to MainNet
2. Implement proper key management
3. Add comprehensive error handling
4. Implement campaign expiration
5. Add donation receipts/certificates
6. Enhanced NGO verification
7. Multi-admin support
8. Campaign goal tracking

## Support

For issues:
1. Check transaction on AlgoExplorer
2. Review browser console logs
3. Verify wallet connection
4. Ensure sufficient ALGO balance

---

Built on Algorand • Transparent • Secure
